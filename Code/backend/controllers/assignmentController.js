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

    // begin assigning
    for (var i = 0; i < allProjects.length; i++) { // loop through allProjects array
        // get project title, skills, number of people required, and the employees who are already assigned to it
        const { title, skills: projectSkills, threshold: projectThreshold, assigned_to } = allProjects[i]
        const projectSkillOnly = [] // includes project skill name only
        const projectCompetencyOnly = [] // includes project skill competency level only

        // populate projectSkillOnly and projectCompetencyOnly array
        for (var j = 0; j < projectSkills.length; j++) {
            projectSkillOnly.push(projectSkills[j].skill)
            projectCompetencyOnly.push(projectSkills[j].competency)
        }

        // an array to track the employees who selected the project in this iteration
        const firstEmployee = []
        const secondEmployee = []
        const thirdEmployee = []

        // shuffle employee array - so that the project will not process the same order of employees in each iteration
        // allEmployees.sort(() => Math.random() - 0.5)

        for (var j = 0; j < allEmployees.length; j++) { // loop through allEmployees array
            // get employee's preference, skills, and a list of projects already assigned
            const { first_choice, second_choice, third_choice, skills: employeeSkills, projects_assigned } = allEmployees[j]
            const employeeSkillOnly = [] // includes employee skill name only
            const employeeCompetencyOnly = [] // includes employee skill competency level only

            // populate employeeSkillOnly and employeeCompetencyOnly array
            for (var k = 0; k < employeeSkills.length; k++) {
                employeeSkillOnly.push(employeeSkills[k].skill)
                employeeCompetencyOnly.push(employeeSkills[k].competency)
            }

            // process project and employee skills
            const matchingSkills = [] // includes skill and competency
            const matchingSkillOnly = [] // includes skill name only
            const matchingCompetencyOnly = [] // includes competency level only

            // populate matchingSkillOnly and matchingCompetencyOnly arrays
            for (var k = 0; k < projectSkillOnly.length; k++) { // loop through projectSkillsOnly array
                if (employeeSkillOnly.includes(projectSkillOnly[k])) { // employee has required project skill
                    matchingSkillOnly.push(projectSkillOnly[k])
                    matchingCompetencyOnly.push(employeeCompetencyOnly[employeeSkillOnly.indexOf(projectSkillOnly[k])])
                }
            }

            // populate matchingSkills array by combining matchingSkillOnly and matchingCompetencyOnly arrays
            for (var k = 0; k < matchingSkillOnly.length; k++) {
                const skill = matchingSkillOnly[k]
                const competency = matchingCompetencyOnly[k]
                matchingSkills.push({skill, competency})
            }

            return res.status(200).json({matchingSkills})

            /* Project is Employee's First Choice */
            if (first_choice === title) {
                /* check the required skills against the skills of the employee */
                // Employee have ALL the relevant SKILLS and COMPETENCY levels are MET
                // if (matchingSkills.length === projectSkills.length) {
                //     if (matchingSkills.competency)
                // }
                

                const numberOfProjectSkills = projectSkills.length // used to check whether employee have > 50% of the required skills
            }
            
            // check projects_assigned length against threshold - employee cannot take more projects than threshold specified
            if (projects_assigned.length === threshold) { // project threshold reached for this employee
                continue // move on to the next employee
            }

            // if project already has the minimum number of people required - projectThreshold
            if (projectThreshold === assigned_to.length) {
                break // move on to the next project
            }
        }
    }
}

// supporting functions for Assignment

// find all projects
const getAllEmployees = async (employees) => {
    // get all employees' information
    const allEmployees = []
    for (var i = 0; i < employees.length; i++) { // loop through employees
        const employee = await User.findOne({ email: employees[i] }) // find employee from User model

        if (!employee) { // if no employee object
            throw Error(`Employee ${employee[i].email} cannot be found`)
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
            throw Error(`Project ${project[i].title} cannot be found`)
        }

        allProjects.push(project) // add employee object into the allProjects array
    }
    return allProjects
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