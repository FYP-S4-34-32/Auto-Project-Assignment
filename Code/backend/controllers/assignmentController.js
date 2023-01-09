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

// // Add employees
// const addEmployees = async (req, res) => {
//     const { id } = req.params
//     const { employees } = req.body

//     // check whether id is a mongoose type object
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(404).json({error: "Invalid Assignment ID"})
//     }

//     // add employees into assignment object
//     try {
//         const assignment = await Assignment.findOneAndUpdate({ _id: id }, {
//             employees
//         })
//     } catch (error) {
//         res.status(400).json({error: error.message})
//     }
// }

// // Add projects
// const addProjects = async (req, res) => {
//     const { id } = req.params
//     const { projects } = req.body

//     // check whether id is a mongoose type object
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(404).json({error: "Invalid Assignment ID"})
//     }

//     // add employees into assignment object
//     try {
//         const assignment = await Assignment.findOneAndUpdate({ _id: id }, {
//             projects
//         })
//     } catch (error) {
//         res.status(400).json({error: error.message})
//     }
// }

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
    allEmployees.sort(() => Math.random() - 0.5) // shuffle employee array

    // get all projects' information
    const allProjects = await getAllProjects(projects)
    allProjects.sort(() => Math.random() - 0.5) // shuffle project array

    // some control flag for the assigning algo
    let priority = 1 // first iteration of the project prioritises firstChoice options, second iteration prioritises secondChoice options, and so on...
    let tier

    // begin assigning
    for (var i = 0; i < allProjects.length; i++) { // loop through allProjects array
        console.log("Processing project[", i, "], title: ", allProjects[i].title, "with priority ", priority)
        console.log("--------------------------------------------------------------")
    
        // get project title, skills, number of people required, and the employees who are already assigned to it
        const { _id: projectID, title, skills: projectSkills, threshold: projectThreshold, assigned_to } = allProjects[i]

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

        if (priority === 1 || priority === 4 || priority === 7 || priority === 10) {
            tier = 1
        } else if (priority === 2 || priority === 5 || priority === 8 || priority === 11) {
            tier = 2
        } else if (priority === 3 || priority === 6 || priority === 7 || priority === 12) {
            tier = 3
        }

        // first choice - prio1 to prio3
        if (priority >= 1 && priority <= 3 && firstChoiceEmployees.length > 0) {
            const prio = processEmployees(tier, firstChoiceEmployees, projectSkillOnly, projectCompetencyOnly)

            if (prio.length > 0) {
                await assignFunction(prio, projectThreshold, threshold, projectID, id)
            }

            if (i === allProjects.length - 1) {
                i = -1 // loop through projects again
                priority++ // increment priority - e.g. prio1 to prio2
                continue
            } else {
                continue // to next project
            }
        } else if (priority >= 4 && priority <= 6 && secondChoiceEmployees.length > 0) {
            const prio = processEmployees(tier, secondChoiceEmployees, projectSkillOnly, projectCompetencyOnly)

            if (prio.length > 0) {
                await assignFunction(prio, projectThreshold, threshold, projectID, id)
            }

            if (i === allProjects.length - 1) {
                i = -1 // loop through projects again
                priority++ // increment priority - e.g. prio1 to prio2
                continue
            } else {
                continue // to next project
            }
        } else if (priority >= 7 && priority <= 9 && thirdChoiceEmployees.length > 0) {
            const prio = processEmployees(tier, thirdChoiceEmployees, projectSkillOnly, projectCompetencyOnly)

            if (prio.length > 0) {
                await assignFunction(prio, projectThreshold, threshold, projectID, id)
            }

            if (i === allProjects.length - 1) {
                i = -1 // loop through projects again
                priority++ // increment priority - e.g. prio1 to prio2
                continue
            } else {
                continue // to next project
            }
        } else if (priority >= 10 && priority <= 12 && notSelected.length > 0) {
            const prio = processEmployees(tier, notSelected, projectSkillOnly, projectCompetencyOnly)

            if (prio.length > 0) {
                await assignFunction(prio, projectThreshold, threshold, projectID, id)
            }

            if (i === allProjects.length - 1) {
                if (priority === 12) {
                    break // or return
                } else {
                    i = -1 // loop through projects again
                    priority++ // increment priority - e.g. prio1 to prio2
                    continue
                }
            } else {
                continue // to next project
            }
        }
    } // end of assignment

    // update stats
    updateStats(id)

    return res.status(200).json("Auto assignment is complete")
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

// updated assign function
const assignFunction = async (employees, projectThreshold, threshold, projectID, assignmentID) => {
    console.log("inside assignFunction")

    console.log("employees: ", employees)

    const project = await Project.findById({ _id: projectID })

    if (!project) {
        console.log("Project cannot be found")
        throw Error("Project cannot be found")
    }

    let currentEmployeeLength = project.assigned_to.employees.length
    console.log("assigned_to: ", project.assigned_to)
    console.log("currentEmployeeLength: ", currentEmployeeLength)

    // loop through employees
    for (var i = 0; i < employees.length; i++) {
        if (projectThreshold === currentEmployeeLength) { // number of people required for the project fulfilled
            console.log("number of people required for the project fulfilled")
            break
        }

        // get employee info
        const { _id: employeeID, email, project_assigned } = employees[i]
        const employee = await User.findById({ _id: employeeID })

        let assignmentExistsInEmployee
        let assignmentIndex

        if (project_assigned.length === 0) {
            assignmentExistsInEmployee = false
        } else {
            for (var j = 0; j < project_assigned.length; j++) {
                if (project_assigned[j].assignment_id === assignmentID) {
                    assignmentExistsInEmployee = true
                    assignmentIndex = j
                    break
                }
            }
        }

        console.log("project_assigned: ", assignmentExistsInEmployee, " at index", assignmentIndex)

        if (assignmentExistsInEmployee && project_assigned[assignmentIndex].projects.length === threshold) {
            console.log("employee already has max number of projects")
            continue // to next employee
        }

        // assign employee to project - update User, Project, and Assignment model
        // Project
        let assignmentExistsInProject

        if (!project.assigned_to.assignment_id || project.assigned_to.assignment_id === "") {
            assignmentExistsInProject = false
        }
        if (project.assigned_to.assignment_id && project.assigned_to.assignment_id !== "") {
            assignmentExistsInProject = true
        }
        
        // if assignment object does not exist yet
        if (!assignmentExistsInProject) {
            console.log("assignment does not exist yet")

            // set assignment id
            project.assigned_to.assignment_id = assignmentID

            // assign to project
            project.assigned_to.employees = [...project.assigned_to.employees, email]
            currentEmployeeLength++
            await project.save()
        } else { // assignment object already exist project object
            console.log("assignment exists")
            
            // assign to prject
            project.assigned_to.employees = [...project.assigned_to.employees, email]
            currentEmployeeLength++
            await project.save()
        }

        // Employee
        // if assigment does not exist yet
        if (!assignmentExistsInEmployee) {
            // set assignment id
            employee.project_assigned = [...employee.project_assigned, { assignment_id: assignmentID, projects: [] }]
            assignmentIndex = 0 // set assignment index
        }

        // assign to employee
        employee.project_assigned[assignmentIndex].projects = [...employee.project_assigned[assignmentIndex].projects, project.title]
        await employee.save()
    }
}

// process employees based on choice and tier
const processEmployees = (tier, employees, projectSkillOnly, projectCompetencyOnly/* other params */) => {
    console.log("Currently inside processEmployees function - this is before assignFunction")
    console.log("Tier = ", tier)
    const prio = []

    // loop through employees
    for (var i = 0; i < employees.length; i++) {
        // get employee info
        const { _id, skills: employeeSkills, project_assigned } = employees[i]

        // get matching skills between project and employee
        const { employeeSkillOnly, employeeCompetencyOnly } = sortEmployeeSkills(employeeSkills)

        const matchingSkills = findMatchingSkills(projectSkillOnly, employeeSkillOnly, employeeCompetencyOnly)

        // compare competency level of the matching skills - projectCompetencyOnly and matchingSkills.competency
        const competencyMet = compareCompetency(projectSkillOnly, projectCompetencyOnly, matchingSkills)

        if (tier === 1) {
            // if employee has all skills and competency met
            if (projectSkillOnly.length === matchingSkills.length) {
                if (competencyMet) {
                    prio.push(employees[i])
                }
            }
        } else if (tier === 2) {
            // if employee has all skills but competency not met
            if (projectSkillOnly.length === matchingSkills.length) {
                if (!competencyMet) {
                    prio.push(employees[i])
                }
            }
        } else if (tier === 3) {
            // if employee has >= 50% of the skills required and competency met
            if (matchingSkills.length < projectSkillOnly.length && matchingSkills.length >= projectSkillOnly.length / 2) {
                if (competencyMet) {
                    prio.push(employees[i])
                }
            }
        }
    }
    return prio
}

const resetAssignment = async (req, res) => {
    const organisation_id = "MSFT"

    // reset projects
    const allProjects = await Project.find({ organisation_id })

    for (var i = 0; i < allProjects.length; i++) {
        allProjects[i].assigned_to.assignment_id = ""
        allProjects[i].assigned_to.employees = []
        allProjects[i].save()
    }

    // reset employees
    const allEmployees = await User.find({ organisation_id, role: "Employee" })

    for (var i = 0; i < allEmployees.length; i++) {
        allEmployees[i].project_assigned = []
        allEmployees[i].save()
    }

    return res.status(200).json("Assignment resetted")
}

// stats
const updateStats = async (_id) => {
    // get _id for assignment
    const assignment = await Assignment.findById({ _id })
    console.log("assignment: ", assignment)

    const employees = assignment.employees

    const assignedFirst = []
    const assignedSecond = []
    const assignedThird = []
    const assignedNotSelected = []
    const notAssigned = []

    // go through each employee
    for (var i = 0; i < employees.length; i++) {
        // get employee info
        const employee = await User.findOne({ email: employees[i] })
        const { firstChoice, secondChoice, thirdChoice, project_assigned } = employee

        // get projects employee is assigned to
        const employeeProjects = []
    
        // no project assigned
        if (project_assigned.length === 0) {
            notAssigned.push(employee.email)
            continue
        }

        // go through the projects assigned to them - project_assigned = { assignment_id, projects: [] }
        for (var j = 0; j < project_assigned.length; j++) {
            if (project_assigned[j].assignment_id === _id) { // get projects from that assignment
                for (var k = 0; k < project_assigned[j].projects.length; k++) {
                    employeeProjects.push(project_assigned[j].projects[k]) // push project into employeeProjects array
                }
                break // exit loop
            }
        }

        for (var j = 0; j < employeeProjects.length; j++) {
            if (employeeProjects[j] === firstChoice) {
                assignedFirst.push(employee.email)
            } else if (employeeProjects[j] === secondChoice) {
                assignedSecond.push(employee.email)
            } else if (employeeProjects[j] === thirdChoice) {
                assignedThird.push(employee.email)
            } else {
                assignedNotSelected.push(employee.email)
            }
        }
    }

    console.log("assignedFirst: ", assignedFirst.length)
    console.log("assignedSecond: ", assignedSecond.length)
    console.log("assignedThird: ", assignedThird.length)
    console.log("assignedNotSelected: ", assignedNotSelected.length)
    console.log("notAssigned: ", notAssigned.length)

    // % of employees assigned their first choice - 2dp
    const firstChoicePercentage = Math.round((assignedFirst.length / employees.length * 100) * 100) / 100

    // % of employees assigned their second choice
    const secondChoicePercentage = Math.round((assignedSecond.length / employees.length * 100) * 100) / 100

    // % of employees assigned their third choice
    const thirdChoicePercentage = Math.round((assignedThird.length / employees.length * 100) * 100) / 100

    // % of employees not assigned to any of their choices
    const notSelectedPercentage = Math.round((assignedNotSelected.length / employees.length * 100) * 100) / 100

    // % of employees not assigned to any projects
    const notAssignedPercentage = Math.round((notAssigned.length / employees.length * 100) * 100) / 100

    // update assignment object
    assignment.first_choice = firstChoicePercentage
    assignment.second_choice = secondChoicePercentage
    assignment.third_choice = thirdChoicePercentage
    assignment.not_selected = notSelectedPercentage
    assignment.not_assigned = notAssignedPercentage
    await assignment.save()
}

// export functions
module.exports = {
    getAssignments,
    getSingleAssignment,
    createAssignment,
    deleteAssignment,
    // addEmployees,
    // addProjects,
    updateAssignment,
    autoAssign,
    resetAssignment
}