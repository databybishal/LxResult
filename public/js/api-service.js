// api-service.js for Netlify + Render deployment

// Production API URL (will be set during Netlify build)
const API_BASE = 'https://resulthub-i9mt.onrender.com/api/students';

console.log('API Base URL:', API_BASE);

class StudentService {
  // Get all students
  static async getAllStudents() {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching students:', error);
      return {
        success: false,
        error: 'Failed to fetch students. Please check your connection.',
      };
    }
  }

  // Get student by roll number
  static async getStudentByRoll(roll) {
    try {
      const response = await fetch(`${API_BASE}/${roll}`);
      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: `Student with roll number ${roll} not found`,
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching student:', error);
      return {
        success: false,
        error: 'Failed to fetch student. Please check your connection.',
      };
    }
  }

  // Add new student
  static async addStudent(studentData) {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding student:', error);
      return {
        success: false,
        error: 'Failed to add student. Please check your connection.',
      };
    }
  }

  // Update student
  static async updateStudent(roll, studentData) {
    try {
      const response = await fetch(`${API_BASE}/${roll}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating student:', error);
      return {
        success: false,
        error: 'Failed to update student. Please check your connection.',
      };
    }
  }

  // Delete student
  static async deleteStudent(roll) {
    try {
      const response = await fetch(`${API_BASE}/${roll}`, {
        method: 'DELETE',
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting student:', error);
      return {
        success: false,
        error: 'Failed to delete student. Please check your connection.',
      };
    }
  }
}

// Make it available globally
window.StudentService = StudentService;
