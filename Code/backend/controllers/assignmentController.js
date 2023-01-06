//==============================================================//
// File which does the heavylifting according to route requests //
//==============================================================//

// imports
const Assignment = require('../models/assignmentModel') // MongoDB model created in assignmentModel.js in the models folder
const User = require('../models/userModel') // to find Users
const Project = require('../models/projectModel') // to find Projects
const mongoose = require('mongoose') // mongoose package for mongodb

// GET all assignments
const getAssignments = async (req, res) => {
    const organisation_id = req.user.organisation_id
    
    const assignments = await Assignment.find({organisation_id}).sort({start_date: 1, end_date: 1}) // sort by earliest start_date

    res.status(200).json(assignments)
}


// GET a single assignment
const getSingleAssignment = async (req, res) => {
    // get id from address bar
    const { id } = req.params

    // check whether id is a mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Invalid Assignment ID'})
    }

    const assignment = await Assignment.findById(id)

    // if document does not exist
    if (!assignment) {
        return res.status(404).json({error: "No such assignment"});
    }

    // document found
    res.status(200).json(assignment)
}

// CREATE a new assignment phase
const createAssignment = async (req, res) => {
    const newAssignment = req.body

    const { title, start_date, end_date, threshold } = req.body

    // track empty fields
    const emptyFields = []
    if (!title) {
        emptyFields.push('title')
    }
    if (!start_date) {
        emptyFields.push('startDate')
    }
    if (!end_date) {
        emptyFields.push('endDate')
    }
    if (!threshold) {
        emptyFields.push('threshold')
    }
    if (start_date > end_date) { // startDate later than endDate
        console.log("error -> Start Date later than End Date")
        emptyFields.push('startDate')
        emptyFields.push('endDate')
    }
    if (threshold < 1) { // threshold less than 1
        console.log("error -> threshold less than 1")
        emptyFields.push('threshold')
    }
    const checkTitle = await Assignment.findOne({title}) // find Assignment object with the given title to check for duplicate entry
    if (checkTitle) {
        console.log("error -> Duplicate Assignment Title entries")
        emptyFields.push('title')
    }
    if (emptyFields.length > 0) { 
        return res.status(400).json({error: "Please double check all the fields.", emptyFields})
    }

    // create new assignment object
    try {
        const assignment = await Assignment.create(newAssignment)
        
        res.status(200).json(assignment)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE assignment
const deleteAssignment = async (req, res) => {

    const { id } = req.params

    // check whether id is a mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Invalid Assignment ID'})
    }
    
    // delete the assignment object
    try {
        const assignment = await Assignment.findOneAndDelete({ _id: id })
        
        res.status(200).json(assignment)
    } catch (error) { // catch any error that pops up during the process
    
        res.status(400).json({error: error.message})
    }
}

// UPDATE assignment
const updateAssignment = async (req, res) => {

    const { id } = req.params

    // check whether id is a mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: "Invalid Assignment ID"})
    }

    // update assignment object
    try {
        const assignment = await Assignment.findOneAndUpdate({ _id: id }, {
            ...req.body // spread the req.body
        })

        res.status(200).json({ assignment })

    } catch (error) { // catch any error that pops up during the process
        res.status(400).json({error: error.message})
    }

}

// Main Assignment Driver
const autoAssign = async (req, res) => {
    // req should include id of assignment object in parameter
    const { id } = req.params

    // check whether id is a mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: "Invalid Assignment ID"})
    }

    // find the assignment object using id
    const assignment = await Assignment.findById(id)

    // if document does not exist
    if (!assignment) {
        return res.status(404).json({error: "No such assignment"});
    }

    // get necessary information from assignment object
    // threshold: number of projects each employee can take up to
    // employees: a list of employees for this assignment phase
    // projects: a list of projects for this assignment phase
    const { threshold, employees, projects } = assignment

    // get all employees' information
    const allEmployees = await getAllEmployees(employees)

    // get all projects' information
    const allProjects = await getAllProjects(projects)

    // some control flag for the assigning algo
    let priority = 1 // first iteration of the project prioritises firstChoice options, second iteration prioritises secondChoice options, and so on...

    // begin assigning
    for (var i = 0; i < allProjects.length; i++) { // loop through allProjects array
        console.log("Processing project[", i, "] with priority ", priority)
    
        // get project title, skills, number of people required, and the employees who are already assigned to it
        const { title, skills: projectSkills, threshold: projectThreshold, assigned_to } = allProjects[i]

        // number of people required for the project fulfilled
        if (projectThreshold === assigned_to.length) {
            continue // to next project
        }

        const projectSkillOnly = [] // includes project skill name only
        const projectCompetencyOnly = [] // includes project skill competency level only

        // populate projectSkillOnly and projectCompetencyOnly array
        for (var j = 0; j < projectSkills.length; j++) {
            projectSkillOnly.push(projectSkills[j].skill)
            projectCompetencyOnly.push(projectSkills[j].competency)
        }

        // an array to track the employees who selected the project in this iteration
        const firstChoiceEmployees = []
        const secondChoiceEmployees = []
        const thirdChoiceEmployees = []
        const notSelected = []

        // shuffle employee array - so that the project will not process the same order of employees in each iteration
        allEmployees.sort(() => Math.random() - 0.5)

        // loop through allEmployees array
        for (var j = 0; j < allEmployees.length; j++) {
            // get employee's preference
            const { firstChoice, secondChoice, thirdChoice } = allEmployees[j]

            if (title === firstChoice) {
                firstChoiceEmployees.push(allEmployees[j])
            } else if (title === secondChoice) {
                secondChoiceEmployees.push(allEmployees[j])
            } else if (title === thirdChoice) {
                thirdChoiceEmployees.push(allEmployees[j])
            } else {
                notSelected.push(allEmployees[j])
            }
        } // end allEmployees loop

        // shuffle arrays
        firstChoiceEmployees.sort(() => Math.random() - 0.5)
        secondChoiceEmployees.sort(() => Math.random() - 0.5)
        thirdChoiceEmployees.sort(() => Math.random() - 0.5)
        notSelected.sort(() => Math.random() - 0.5)

        // console.log("firstChoiceEmployee: ", firstChoiceEmployee.length)
        // console.log("secondChoiceEmployee: ", secondChoiceEmployee.length)
        // console.log("thirdChoiceEmployee: ", thirdChoiceEmployee.length)
        // console.log("notSelected: ", notSelected.length)

        // console.log('\n')

        // console.log(projectSkillOnly) // e.g. ['Swift', 'React Native', 'C']
        // console.log(projectCompetencyOnly) // e.g. ['Advanced', 'Intermediate', 'Beginner']

        // loop through first choice
        if (priority === 1 && firstChoiceEmployees.length > 0) {
            console.log("Processing priority ", priority, " with firstChoiceEmployees")
            assignEmployee(firstChoiceEmployees, threshold, projectThreshold, assigned_to, projectSkillOnly, projectCompetencyOnly)

            if (i === allProjects.length - 1) {
                i = -1 // loop through project again
                priority++ // increment priority - e.g. from firstChoice to secondChoice
                console.log("priority after incrementing: ", priority)
                continue
            } else {
                continue // move to next project
            }
        } // end first choice loop

        // loop through second choice
        if (priority === 2 && secondChoiceEmployees.length > 0) {
            console.log("Processing priority ", priority, " with secondChoiceEmployees")
            assignEmployee(secondChoiceEmployees, threshold, projectThreshold, assigned_to, projectSkillOnly, projectCompetencyOnly)

            if (i === allProjects.length - 1) {
                i = -1 // loop through project again
                priority++ // increment priority - e.g. from firstChoice to secondChoice
                console.log("priority after incrementing: ", priority)
                continue
            } else {
                continue // move to next project
            }
        } // end second choice loop

        // loop through third choice
        if (priority === 3 && thirdChoiceEmployees.length > 0) {
            console.log("Processing priority ", priority, " with thirdChoiceEmployees")
            assignEmployee(thirdChoiceEmployees, threshold, projectThreshold, assigned_to, projectSkillOnly, projectCompetencyOnly)

            if (i === allProjects.length - 1) {
                i = -1 // loop through project again
                priority++ // increment priority - e.g. from firstChoice to secondChoice
                console.log("priority after incrementing: ", priority)
                continue
            } else {
                continue // move to next project
            }
        } // end third choice loop

        // loop through not selected - as of now, this will be our last group of people, im looking into an outliers list next
        if (priority === 4 && notSelected.length > 0) {
            console.log("Processing priority ", priority, " with notSelected")
            assignEmployee(notSelected, threshold, projectThreshold, assigned_to, projectSkillOnly, projectCompetencyOnly)

            if (i === allProjects.length - 1) {
                console.log("Last person processed")
                break // exit loop - projects are all processed
            } else {
                continue // move to next project
            }
        } // end not selected loop
    }
}

/* Supporting Functions for Assignment */
// find all projects
const getAllEmployees = async (employees) => {
    // get all employees' information
    const allEmployees = []
    for (var i = 0; i < employees.length; i++) { // loop through employees
        const employee = await User.findOne({ email: employees[i] }) // find employee from User model

        if (!employee) { // if no employee object
            throw Error(`Employee ${employees[i]} cannot be found`)
        }

        allEmployees.push(employee) // add employee object into the allEmployees array
    }
    return allEmployees
}

// find all projects
const getAllProjects = async (projects) => {
    // get all projects' information
    const allProjects = []
    for (var i = 0; i < projects.length; i++) { // loop through projects
        const project = await Project.findById({ _id: projects[i] }) // find project from Project model

        if (!project) { // if no project object
            throw Error(`Project ${projects[i]} cannot be found`)
        }

        allProjects.push(project) // add employee object into the allProjects array
    }
    return allProjects
}

// sort out employees' skills
const sortEmployeeSkills = employeeSkills => {
    const employeeSkillOnly = [] // includes employee skill name only
    const employeeCompetencyOnly = [] // includes employee skill competency level only

    // populate employeeSkillOnly and employeeCompetencyOnly array
    for (var i = 0; i < employeeSkills.length; i++) {
        employeeSkillOnly.push(employeeSkills[i].skill)
        employeeCompetencyOnly.push(employeeSkills[i].competency)
    }

    return { employeeSkillOnly, employeeCompetencyOnly }
}

// find matching skills between project and employee
const findMatchingSkills = (projectSkillOnly, employeeSkillOnly, employeeCompetencyOnly) => {
    // process project and employee skills
    const matchingSkills = [] // includes skill and competency
    const matchingSkillOnly = [] // includes skill name only
    const matchingCompetencyOnly = [] // includes competency level only - of matching skills, not indicative of whether it matches the project skill's competency

    // populate matchingSkillOnly and matchingCompetencyOnly arrays
    for (var i = 0; i < projectSkillOnly.length; i++) { // loop through projectSkillsOnly array
        if (employeeSkillOnly.includes(projectSkillOnly[i])) { // employee has required project skill
            matchingSkillOnly.push(projectSkillOnly[i])
            matchingCompetencyOnly.push(employeeCompetencyOnly[employeeSkillOnly.indexOf(projectSkillOnly[i])])
        }
    }

    // populate matchingSkills array by combining matchingSkillOnly and matchingCompetencyOnly arrays
    for (var i = 0; i < matchingSkillOnly.length; i++) {
        const skill = matchingSkillOnly[i]
        const competency = matchingCompetencyOnly[i]
        matchingSkills.push({skill, competency})
    }

    return matchingSkills
}

// compare competency level between project's skills and the matching skills that the employee has
const compareCompetency = (projectSkillOnly, projectCompetencyOnly, matchingSkills) => {
    let competencyMet = false
    for (var i = 0; i < matchingSkills.length; i++) { // loop through matching skills only - ignore unmatched skills
        const { skill, competency: userCompetency } = matchingSkills[i] // destructure the skill and competency value
        const index = projectSkillOnly.indexOf(skill) // get the index of the skills in projectSkillOnly array and use it to check in projectCompetencyOnly array
        const projectCompetency = projectCompetencyOnly[index] // get the competency level of the specified skill

        // compare competency
        if (projectCompetency === "Beginner") { // scenario 1: projectCompetency === Beginner
            // minimum competency level === Beginner - competency level met
            competencyMet = true
        } else if (projectCompetency === "Intermediate") { // scenario 2: projectCompetency === Intermediate
            // if userCompetency === Beginner - competency level not met
            if (userCompetency === "Beginner") {
                competencyMet = false
            } else if (userCompetency === "Intermediate" || userCompetency === "Advanced") { // competency level met
                competencyMet = true
            }
        } else if (projectCompetency === "Advanced") { // scenario 3: projectCompetency === Advanced
            // if userCompetency === Beginner || userCompetency === Intermediate - competency level not met
            if (userCompetency === "Beginner" || userCompetency === "Intermediate") {
                competencyMet = false
            } else if (userCompetency === "Advanced") { // competency level met
                competencyMet = true
            }
        }
    }
    return competencyMet    
} 

// based on priority - firstChoice/secondChoice/thirdChoice/notSelected
const assignEmployee = async (employees, threshold, projectThreshold, assigned_to, projectSkillOnly, projectCompetencyOnly) => {
    console.log("inside assignEmployee, employees.length: ", employees.length)
    for (var i = 0; i < employees.length; i++) {
        if (projectThreshold === assigned_to.length) { // number of people required for the project fulfilled
            break
        }

        // get employee info
        const { _id, skills: employeeSkills, project_assigned } = employees[i]

        if (project_assigned === threshold) { // employee already assigned max number of projects
            continue // to next employee
        }
        
        // get matching skills between project and employee
        const { employeeSkillOnly, employeeCompetencyOnly } = sortEmployeeSkills(employeeSkills)

        const matchingSkills = findMatchingSkills(projectSkillOnly, employeeSkillOnly, employeeCompetencyOnly)

        // compare competency level of the matching skills - projectCompetencyOnly and matchingSkills.competency
        const competencyMet = compareCompetency(projectSkillOnly, projectCompetencyOnly, matchingSkills)

        console.log(employees[i].email)
        // console.log(projectSkillOnly)
        // console.log(projectCompetencyOnly)
        // console.log(employeeSkillOnly)
        // console.log(employeeCompetencyOnly)
        console.log(matchingSkills)
        console.log(competencyMet)
        console.log(projectSkillOnly.length / 2)

        // if employee has all the skills the project requires
        // NOTE: based on our algo, as long as the employee has all the required skills,
        // its an auto assign since competencyMet or !competencyMet is just beside each other in the priority list
        if (projectSkillOnly.length === matchingSkills.length) {
            if (competencyMet) { // AND competency level for every skill is met
                // assign
            } else if (!competencyMet) {
                // assign
            }
        } else if ((matchingSkills.length >= projectSkillOnly.length / 2) && competencyMet) { // employee has more than half of the skills required for the project, and competency level is met for them
            // assign
        }
    }
}

// export functions
module.exports = {
    getAssignments,
    getSingleAssignment,
    createAssignment,
    deleteAssignment,
    updateAssignment,
    autoAssign
}