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

// ADD employees into assignment object
const updateEmployees = async (req, res) => {
    const { id } = req.params

    const { employees } = req.body

    // check whether id is a mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: "Invalid Assignment ID"})
    }

    // update assignment object
    try {
        const assignment = await Assignment.findById({ _id: id })

        assignment.set({employees});
        await assignment.save()

        res.status(200).json({ assignment })

    } catch (error) { // catch any error that pops up during the process
        res.status(400).json({error: error.message})
    }
}


// DELETE employee from assignment
const deleteEmployees = async(req, res) => {
    const { id } = req.params

    const { employees } = req.body

    // check whether id is a mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: "Invalid Assignment ID"})
    }

    // update assignment object
    try {
        const assignment = await Assignment.findById({ _id: id })

        for (var i = 0; i < employees.length; i++) {
            if (assignment.employees.includes(employees[i])) {
                const index = assignment.employees.indexOf(employees[i])

                // remove employee
                assignment.employees.splice(index, 1)
            }
        }
        await assignment.save()

        res.status(200).json({ assignment })

    } catch (error) { // catch any error that pops up during the process
        res.status(400).json({error: error.message})
    }
}

// ADD projects into assignment object
const updateProjects = async (req, res) => {
    const { id } = req.params

    const { projects } = req.body

    // check whether id is a mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: "Invalid Assignment ID"})
    }

    // update assignment object
    try {
        const assignment = await Assignment.findById({ _id: id })

        for (var i = 0; i < projects.length; i++) {
            assignment.projects = [...assignment.projects, projects[i]]
        }
        await assignment.save()

        res.status(200).json({ assignment })

    } catch (error) { // catch any error that pops up during the process
        res.status(400).json({error: error.message})
    }

}

// DELETE project from assignment
const deleteProjects = async(req, res) => {
    const { id } = req.params

    const { projects } = req.body

    // check whether id is a mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: "Invalid Assignment ID"})
    }

    // update assignment object
    try {
        const assignment = await Assignment.findById({ _id: id })

        for (var i = 0; i < projects.length; i++) {
            if (assignment.projects.includes(projects[i])) {
                const index = assignment.projects.indexOf(projects[i])

                // remove project
                assignment.projects.splice(index, 1)
            }
        }
        await assignment.save()

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
    allEmployees.sort(() => Math.random() - 0.5) // shuffle employee array

    // get all projects' information
    const allProjects = await getAllProjects(projects)
    allProjects.sort(() => Math.random() - 0.5) // shuffle project array

    // some control flag for the assigning algo
    let priority = 1 // refer to priority list at the bottom
    let tier // refer to tier list at the bottom

    // begin assigning
    for (var i = 0; i < allProjects.length; i++) { // loop through allProjects array
        console.log("Processing ", allProjects[i].title, "with priority ", priority)
    
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

        // set
        if (priority === 1 || priority === 4 || priority === 7 || priority === 10) {
            tier = 1
        } else if (priority === 2 || priority === 5 || priority === 8 || priority === 11) {
            tier = 2
        } else if (priority === 3 || priority === 6 || priority === 7 || priority === 12) {
            tier = 3
        } else if (priority >= 13 && priority <= 16) {
            tier = 4
        } else if (priority >= 17 && priority <= 20) {
            tier = 5
        } else if (priority >= 21 && priority <= 24) {
            tier = 6
        } else if (priority >= 25 && priority <= 28) {
            tier = 7
        }

        // first choice
        if ((priority >= 1 && priority <= 3) || // 1: all skills + competency met; 2: all skills + competency not met; 3: >= half skills + competency met
                priority === 13 || // >= half skills + competency not met
                priority === 17 || // < half skills + competency met
                priority === 21 || // < half skills + competency not met
                priority === 25) { // none of the required skills
            if (firstChoiceEmployees.length > 0) {
                const prio = processEmployees(tier, firstChoiceEmployees, projectSkillOnly, projectCompetencyOnly)

                if (prio.length > 0) {
                    await assignFunction(tier, prio, projectThreshold, threshold, projectID, id)
                }
            }

            if (i === allProjects.length - 1) {
                i = -1 // loop through projects again
                priority++ // increment priority - e.g. prio1 to prio2
                continue
            } else {
                continue // to next project
            }
        } else if ((priority >= 4 && priority <= 6) || // 4: all skills + competency met; 5: all skills + competency not met; 6: >= half skills + competency met
                priority === 14 || // >= half skills + competency not met
                priority === 18 || // < half skills + competency met
                priority === 22 || // < half skills + competency not met
                priority === 26) { // none of the required skills
            if (secondChoiceEmployees.length > 0) {
                const prio = processEmployees(tier, secondChoiceEmployees, projectSkillOnly, projectCompetencyOnly)

                if (prio.length > 0) {
                    await assignFunction(tier, prio, projectThreshold, threshold, projectID, id)
                }                
            }

            if (i === allProjects.length - 1) {
                i = -1 // loop through projects again
                priority++ // increment priority - e.g. prio1 to prio2
                continue
            } else {
                continue // to next project
            }
        } else if ((priority >= 7 && priority <= 9) || // 7: all skills + competency met; 8: all skills + competency not met; 9: >= half skills + competency met
                priority === 15 || // >= half skills + competency not met
                priority === 19 || // < half skills + competency met
                priority === 23 || // < half skills + competency not met
                priority === 27) { // none of the required skills
            if (thirdChoiceEmployees.length > 0) {
                const prio = processEmployees(tier, thirdChoiceEmployees, projectSkillOnly, projectCompetencyOnly)

                if (prio.length > 0) {
                    await assignFunction(tier, prio, projectThreshold, threshold, projectID, id)
                }
            }

            if (i === allProjects.length - 1) {
                i = -1 // loop through projects again
                priority++ // increment priority - e.g. prio1 to prio2
                continue
            } else {
                continue // to next project
            }
        } else if ((priority >= 10 && priority <= 12) || // 10: all skills + competency met; 11: all skills + competency not met; 12: >= half skills + competency met
                priority === 16 || // >= half skills + competency not met
                priority === 20 || // < half skills + competency met
                priority === 24 || // < half skills + competency not met
                priority === 28) { // none of the required skills)
            
            if (notSelected.length > 0) {
                const prio = processEmployees(tier, notSelected, projectSkillOnly, projectCompetencyOnly)

                if (prio.length > 0) {
                    await assignFunction(tier, prio, projectThreshold, threshold, projectID, id)
                }
            }

            if (i === allProjects.length - 1) {
                if (priority === 28) { // end of priority tree
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
    projectStats(id)

    return res.status(200).json("Auto assignment is complete")
}

/* Supporting Functions for Assignment */
// find all projects
const getAllEmployees = async (employees) => {
    // get all employees' information
    const allEmployees = []
    for (var i = 0; i < employees.length; i++) { // loop through employees
        const employee = await User.findOne({ email: employees[i].email }) // find employee from User model

        if (!employee) { // if no employee object
            throw Error(`Employee ${employees[i].email} cannot be found`)
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
        const project = await Project.findOne({ title: projects[i] }) // find project from Project model

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
const assignFunction = async (tier, employees, projectThreshold, threshold, projectID, assignmentID) => {
    console.log("inside assignFunction")

    const project = await Project.findById({ _id: projectID })

    if (!project) {
        console.log("Project cannot be found")
        throw Error("Project cannot be found")
    }

    let currentEmployeeLength = project.assigned_to.employees.length

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
            // set assignment id
            project.assigned_to.assignment_id = assignmentID

            // assign to project
            project.assigned_to.employees = [...project.assigned_to.employees, email]
            currentEmployeeLength++
            await project.save()
        } else { // assignment object already exist project object
            // assign to project
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

        console.log(email, "assigned to", project.title, "with tier", tier)
    }
    console.log()
}

// process employees based on choice and tier
const processEmployees = (tier, employees, projectSkillOnly, projectCompetencyOnly) => {
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

        if (tier === 1) { // if employee has all skills and competency met
            if (projectSkillOnly.length === matchingSkills.length) {
                if (competencyMet) {
                    prio.push(employees[i])
                }
            }
        } else if (tier === 2) { // if employee has all skills but competency not met
            if (projectSkillOnly.length === matchingSkills.length) {
                if (!competencyMet) {
                    prio.push(employees[i])
                }
            }
        } else if (tier === 3) { // if employee has >= 50% of the skills required and competency met
            if (matchingSkills.length < projectSkillOnly.length && matchingSkills.length >= projectSkillOnly.length / 2) {
                if (competencyMet) {
                    prio.push(employees[i])
                }
            }
        } else if (tier === 4) { // if employee has >= 50% of the skills required but competency not met
            if (matchingSkills.length < projectSkillOnly.length && matchingSkills.length >= projectSkillOnly.length / 2) {
                if (!competencyMet) {
                    prio.push(employees[i])
                }
            }
        } else if (tier === 5) { // if employeee >0% && <50% of skills and competency met
            if (matchingSkills.length > 0 && matchingSkills.length < projectSkillOnly.length / 2) {
                if (competencyMet) {
                    prio.push(employees[i])
                }
            }
        } else if (tier === 6) { // if employeee >0% && <50% of skills but competency not met
            if (matchingSkills.length > 0 && matchingSkills.length < projectSkillOnly.length / 2) {
                if (!competencyMet) {
                    prio.push(employees[i])
                }
            }
        } else if (tier === 7) { // if employeee has none of the required skills
            if (matchingSkills.length === 0) {
                prio.push(employees[i])
            }
        }
    }
    return prio
}

// reset assignment
const resetAssignment = async (req, res) => {
    const assignment = await Assignment.findOne({ title: "Assignment 6"})

    if (!assignment) {
        return res.status(404).json({error: "Assignment cannot be found"})
    }

    // reset assignment stats
    assignment.first_choice = null
    assignment.second_choice = null
    assignment.third_choice = null
    assignment.not_selected = null
    assignment.not_assigned = null
    await assignment.save()

    const { projects, employees } = assignment

    // reset projects
    for (var i = 0; i < projects.length; i++) {
        const project = await Project.findOne({ title: projects[i] })

        project.assigned_to.assignment_id = ""
        project.assigned_to.employees = []
        project.firstChoice = null
        project.secondChoice = null
        project.thirdChoice = null
        project.notSelected = null
        project.save()
    }

    // reset employees
    for (var i = 0; i < employees.length; i++) {
        const employee = await User.findOne({ email: employees[i].email })

        employee.project_assigned = []
        employee.save()
    }

    return res.status(200).json("Assignment resetted")
}

// stats
// update stats for assignment object - how many got their first/second/third choice etc.
const updateStats = async (_id) => {
    // get _id for assignment
    const assignment = await Assignment.findById({ _id })
    const employees = assignment.employees

    const assignedFirst = []
    const assignedSecond = []
    const assignedThird = []
    const assignedNotSelected = []
    const notAssigned = []

    // go through each employee
    for (var i = 0; i < employees.length; i++) {
        // get employee info
        const employee = await User.findOne({ email: employees[i].email })
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

        console.log(employees[i], "assigned to: ")
        for (var j = 0; j < employeeProjects.length; j++) {
            console.log(employeeProjects[j])
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
        console.log()
    }

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

// update stats for each project after the assignment phase
const projectStats = async (_id) => {
    // get _id for assignment
    const assignment = await Assignment.findById({ _id })
    const projects = assignment.projects

    // go through each project
    for (var i = 0; i < projects.length; i++) {
        const project = await Project.findOne({ title: projects[i] })
        const { assigned_to } = project // { assignment_id, employees: [] }
        const { employees } = assigned_to

        const assignedFirst = []
        const assignedSecond = []
        const assignedThird = []
        const assignedNotSelected = []

        // go through each employee
        for (var j = 0; j < employees.length; j++) {
            const employee = await User.findOne({ email: employees[j] })

            const { firstChoice, secondChoice, thirdChoice } = employee

            if (project.title === firstChoice) {
                assignedFirst.push(employee.email)
            } else if (project.title === secondChoice) {
                assignedSecond.push(employee.email)
            } else if (project.title === thirdChoice) {
                assignedThird.push(employee.email)
            } else {
                assignedNotSelected.push(employee.email)
            }
        }

        project.firstChoice = assignedFirst.length
        project.secondChoice = assignedSecond.length
        project.thirdChoice = assignedThird.length
        project.notSelected = assignedNotSelected.length
        await project.save()
    }
}

// export functions
module.exports = {
    getAssignments,
    getSingleAssignment,
    createAssignment,
    deleteAssignment,
    updateAssignment,
    updateEmployees,
    deleteEmployees,
    updateProjects,
    deleteProjects,
    autoAssign,
    resetAssignment
}


// Priority Tree
// Prio 1: FIRST choice and ALL skills and competency MET - TIER 1
// Prio 2: FIRST choice and ALL skills but competency NOT met - TIER 2
// Prio 3: FIRST choice and >=50% of skills and competency met - TIER 3
// Prio 4: SECOND choice and ALL skills and competency MET - TIER 1
// Prio 5: SECOND choice and ALL skills but competency NOT met - TIER 2
// Prio 6: SECOND choice and >=50% of skills and competency met - TIER 3
// Prio 7: THIRD choice and ALL skills and competency MET - TIER 1
// Prio 8: THIRD choice and ALL skills but competency NOT met - TIER 2
// Prio 9: THIRD choice and >=50% of skills and competency met - TIER 3
// Prio 10: NOT SELECTED and ALL skills and competency MET - TIER 1
// Prio 11: NOT SELECTED and ALL skills but competency NOT met - TIER 2
// Prio 12: NOT SELECTED and >=50% of skills and competency met - TIER 3
// Prio 13: FIRST choice and >=50% of skills but competency not met - TIER 4
// Prio 14: SECOND choice and >=50% of skills but competency not met - TIER 4
// Prio 15: THIRD choice and >=50% of skills but competency not met - TIER 4
// Prio 16: NOT SELECTED and >=50% of skills but competency not met - TIER 4
// Prio 17: FIRST choice and >0% && <50% of skills and competency met - TIER 5
// Prio 18: SECOND choice and >0% && <50% of skills and competency met - TIER 5
// Prio 19: THIRD choice and >0% && <50% of skills and competency met - TIER 5
// Prio 20: NOT SELECTED and >0% && <50% of skills and competency met - TIER 5
// Prio 21: FIRST choice and >0% && <50% of skills but competency not met - TIER 6
// Prio 22: SECOND SELECTED and >0% && <50% of skills but competency not met - TIER 6
// Prio 23: THIRD SELECTED and >0% && <50% of skills but competency not met - TIER 6
// Prio 24: NOT SELECTED and >0% && <50% of skills but competency not met - TIER 6
// Prio 25: FIRST choice and no required skills - TIER 7
// Prio 26: SECOND choice and no required skills - TIER 7
// Prio 27: THIRD choice and no required skills - TIER 7
// Prio 28: NOT SELECTED and no required skills - TIER 7


// tier1: ALL skills and competency MET
// tier2: ALL skills but competency not met
// tier3: >=50% skills and competency met
// tier4 : >= 50% skills but competency not met
// tier5: >0% && <50% of skills and competency met 
// tier6: >0% && 50% of skills but competency not met
// tier7: no required skills