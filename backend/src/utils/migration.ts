import Student from '../models/Student';
import { recalculateStudentMetrics } from '../controllers/studentController';

export const runMigrations = async (): Promise<void> => {
  try {
    console.log('🔄 Checking database records for missing attributes...');
    const students = await Student.find();

    let updatedCount = 0;
    for (const student of students) {
      let isUpdated = false;

      if (!student.skills || student.skills.length === 0) {
        student.skills = [
          { name: 'JavaScript', level: 'Intermediate' },
          { name: 'Communication', level: 'Intermediate' },
          { name: 'Problem Solving', level: 'Beginner' }
        ];
        isUpdated = true;
      }

      if (!student.projects || student.projects.length === 0) {
        student.projects = [
          {
            title: 'Campus Portal Website',
            description: 'Built a responsive student management landing portal and dashboard.',
            url: 'https://github.com/example/campus-portal'
          }
        ];
        isUpdated = true;
      }

      if (!student.certifications || student.certifications.length === 0) {
        student.certifications = [
          {
            name: 'Introduction to Web Dev',
            issuingOrganization: 'Coursera',
            date: new Date('2025-06-15'),
            credentialId: 'COURSERA-WD-101'
          }
        ];
        isUpdated = true;
      }

      if (student.aptitudeScore === undefined || student.aptitudeScore === 0) {
        // Generate random aptitude score between 60 and 95
        student.aptitudeScore = Math.floor(Math.random() * 36) + 60;
        isUpdated = true;
      }

      if (student.communicationScore === undefined || student.communicationScore === 0) {
        // Generate random communication score between 65 and 98
        student.communicationScore = Math.floor(Math.random() * 34) + 65;
        isUpdated = true;
      }

      if (isUpdated) {
        await student.save();
        // Recalculate risk level and placement score based on new stats
        await recalculateStudentMetrics(student._id.toString());
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`✅ Successfully updated ${updatedCount} student records with default skills/scores.`);
    } else {
      console.log('✅ All student records are already up to date.');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};
