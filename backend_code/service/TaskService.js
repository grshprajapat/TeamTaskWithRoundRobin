// services/TaskService.js
const { Sequelize } = require('sequelize');
const Task = require('../models/task');
const Team = require('../models/team');
const TeamMember = require('../models/teamMember');

class TaskService {
  static async createTeam(name) {
    try {
      const team = await Team.create({ name });
      return team;
    } catch (error) {
      throw error;
    }
  }

  static async createTask(description, teamId) {
    try {
      // Fetch all team members for the selected team, ordered by priority in ascending order.
      const teamMembers = await TeamMember.findAll({
        where: { teamId },
        order: [['priority', 'ASC']],
      });

      if (teamMembers.length === 0) {
        throw new Error('No team members available for this team');
      }

      // Determine the next team member to assign the task to based on priority and round-robin.
      let nextAssignee = null;
      let startIndex = 0;
        // Keep track of whether a task was assigned in this round.
    let taskAssigned = false;
      while (!nextAssignee) {
        const currentMember = teamMembers[startIndex];

        // Check if the current team member has the highest priority among unassigned tasks.
        if (
          !(await Task.findOne({
            where: {
              assignee: currentMember.name,
              teamId: teamId,
              priority: null, // Add this condition to check for unassigned tasks
            },
          }))
        ) {
          nextAssignee = currentMember;
          taskAssigned = true; 
        }

        startIndex = (startIndex + 1) % teamMembers.length; // Circular increment
        if (startIndex === 0 && !taskAssigned) {
          throw new Error('All team members for this team have tasks assigned');
        }
        if (startIndex === 0) {
          taskAssigned = false;
        }
      }

      // Create the task with the given description and team ID.
      const newTask = await Task.create({ description, teamId });

      // Assign the task to the next team member and update the task's assignee.
      newTask.assignee = nextAssignee.name;

      // Save the task to update the assignee.
      await newTask.save();

      console.log({ message: 'Task assigned successfully', newTask });

      return newTask;
    } catch (error) {
      console.log({ error: error.message });
      throw error; // Re-throw the error to handle it elsewhere if needed.
    }
  }

  
}

module.exports = TaskService;
