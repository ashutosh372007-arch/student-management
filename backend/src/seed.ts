import mongoose from 'mongoose';
import connectDB from './config/db';
import Student from './models/Student';
import Teacher from './models/Teacher';
import Class from './models/Class';
import Timetable from './models/Timetable';
import Attendance from './models/Attendance';
import User from './models/User';
import Result from './models/Result';
import Fee from './models/Fee';
import Assignment from './models/Assignment';
import Submission from './models/Submission';
import Notification from './models/Notification';

const SEED_TEACHERS = [
  { name: 'Dr. Rajesh Kumar', subject: 'Mathematics', qualification: 'Ph.D in Mathematics', contact: '9876543210', email: 'rajesh.kumar@school.com', gender: 'Male', address: '123, Sector 15, Noida', salary: 75000 },
  { name: 'Sunita Deshmukh', subject: 'Physics', qualification: 'M.Sc in Physics, B.Ed', contact: '9876543211', email: 'sunita.deshmukh@school.com', gender: 'Female', address: '45, Preet Vihar, Delhi', salary: 65000 },
  { name: 'Anil Wadhwa', subject: 'Chemistry', qualification: 'M.Sc in Chemistry', contact: '9876543212', email: 'anil.wadhwa@school.com', gender: 'Male', address: '89, Malviya Nagar, Jaipur', salary: 60000 },
  { name: 'Priya Sebastian', subject: 'English', qualification: 'M.A. in English Literature', contact: '9876543213', email: 'priya.sebastian@school.com', gender: 'Female', address: '12, Indiranagar, Bangalore', salary: 55000 },
  { name: 'Dr. Amit Bhardwaj', subject: 'Biology', qualification: 'Ph.D in Botany', contact: '9876543214', email: 'amit.bhardwaj@school.com', gender: 'Male', address: '56, Salt Lake, Kolkata', salary: 72000 },
  { name: 'Meenakshi Sundaram', subject: 'History', qualification: 'M.A. in History, B.Ed', contact: '9876543215', email: 'meenakshi.sundaram@school.com', gender: 'Female', address: '78, Anna Nagar, Chennai', salary: 52000 },
  { name: 'Vikram Rathore', subject: 'Geography', qualification: 'M.A. in Geography', contact: '9876543216', email: 'vikram.rathore@school.com', gender: 'Male', address: '34, Vaishali Nagar, Jaipur', salary: 50000 },
  { name: 'Shalini Hegde', subject: 'Computer Science', qualification: 'M.Tech in CSE', contact: '9876543217', email: 'shalini.hegde@school.com', gender: 'Female', address: '90, Koramangala, Bangalore', salary: 68000 },
  { name: 'Suresh Raina', subject: 'Physical Education', qualification: 'M.P.Ed', contact: '9876543218', email: 'suresh.raina@school.com', gender: 'Male', address: '15, Model Town, Ghaziabad', salary: 48000 },
  { name: 'Neha Kakkar', subject: 'Music', qualification: 'M.Mus', contact: '9876543219', email: 'neha.kakkar@school.com', gender: 'Female', address: '22, Bandra West, Mumbai', salary: 45000 },
  { name: 'Ravi Shastri', subject: 'Civics', qualification: 'M.A. in Political Science', contact: '9876543220', email: 'ravi.shastri@school.com', gender: 'Male', address: '67, Civil Lines, Prayagraj', salary: 53000 },
  { name: 'Divya Dutta', subject: 'Art', qualification: 'B.FA, M.FA', contact: '9876543221', email: 'divya.dutta@school.com', gender: 'Female', address: '43, Lokhandwala, Mumbai', salary: 46000 },
  { name: 'Dr. Sanjay Gupta', subject: 'Economics', qualification: 'Ph.D in Economics', contact: '9876543222', email: 'sanjay.gupta@school.com', gender: 'Male', address: '102, Saket, Delhi', salary: 70000 },
  { name: 'Vandana Shiva', subject: 'Environmental Science', qualification: 'Ph.D in Environmental Studies', contact: '9876543223', email: 'vandana.shiva@school.com', gender: 'Female', address: '7, Dehradun Valley, Dehradun', salary: 62000 },
  { name: 'Abhinav Bindra', subject: 'Sports Science', qualification: 'B.Sc in Sports Management', contact: '9876543224', email: 'abhinav.bindra@school.com', gender: 'Male', address: '28, Sector 4, Chandigarh', salary: 50000 },
  { name: 'Kiran Bedi', subject: 'Social Studies', qualification: 'M.A. in Public Administration', contact: '9876543225', email: 'kiran.bedi@school.com', gender: 'Female', address: '55, Dwarka, Delhi', salary: 58000 },
  { name: 'Harish Salve', subject: 'Political Science', qualification: 'LL.M', contact: '9876543226', email: 'harish.salve@school.com', gender: 'Male', address: '88, Vasant Kunj, Delhi', salary: 64000 },
  { name: 'Sudha Murty', subject: 'Moral Science', qualification: 'M.Tech in Electrical Eng, Author', contact: '9876543227', email: 'sudha.murty@school.com', gender: 'Female', address: '11, Jayanagar, Bangalore', salary: 60000 },
  { name: 'Raghuram Rajan', subject: 'Business Studies', qualification: 'Ph.D in Management', contact: '9876543228', email: 'raghuram.rajan@school.com', gender: 'Male', address: '99, Nungambakkam, Chennai', salary: 74000 },
  { name: 'Arundhati Roy', subject: 'Creative Writing', qualification: 'B.Arch, Author', contact: '9876543229', email: 'arundhati.roy@school.com', gender: 'Female', address: '6, Chanakyapuri, Delhi', salary: 55000 }
];

const SEED_STUDENTS = [
  // Class 10-A
  { name: 'Aarav Sharma', gender: 'Male', dob: '2011-05-15', parentName: 'Ramesh Sharma', contact: '9123456780', parentContact: '9812345670', address: 'Flat 402, Shanti Apartments, Noida', email: 'aarav.sharma@student.com' },
  { name: 'Ananya Patel', gender: 'Female', dob: '2011-08-22', parentName: 'Suresh Patel', contact: '9123456781', parentContact: '9812345671', address: 'Plot 45, GIDC Colony, Ahmedabad', email: 'ananya.patel@student.com' },
  { name: 'Kabir Mehta', gender: 'Male', dob: '2011-03-10', parentName: 'Vijay Mehta', contact: '9123456782', parentContact: '9812345672', address: '12-B, Marine Drive, Mumbai', email: 'kabir.mehta@student.com' },
  { name: 'Diya Iyer', gender: 'Female', dob: '2011-12-05', parentName: 'Karthik Iyer', contact: '9123456783', parentContact: '9812345673', address: 'Flat A3, Adyar Heights, Chennai', email: 'diya.iyer@student.com' },
  { name: 'Ishaan Gupta', gender: 'Male', dob: '2011-01-28', parentName: 'Sanjay Gupta', contact: '9123456784', parentContact: '9812345674', address: 'H.No. 456, Karol Bagh, Delhi', email: 'ishaan.gupta@student.com' },
  { name: 'Saanvi Nair', gender: 'Female', dob: '2011-07-14', parentName: 'Madhavan Nair', contact: '9123456785', parentContact: '9812345675', address: 'Nair Villa, Kakkanad, Kochi', email: 'saanvi.nair@student.com' },
  { name: 'Vivaan Kapoor', gender: 'Male', dob: '2011-02-18', parentName: 'Anil Kapoor', contact: '9123456786', parentContact: '9812345676', address: '78, Sector 17, Chandigarh', email: 'vivaan.kapoor@student.com' },
  { name: 'Myra Joshi', gender: 'Female', dob: '2011-10-09', parentName: 'Dinesh Joshi', contact: '9123456787', parentContact: '9812345677', address: '33, Khas Bagh, Pune', email: 'myra.joshi@student.com' },
  { name: 'Aditya Verma', gender: 'Male', dob: '2011-09-30', parentName: 'Rajinder Verma', contact: '9123456788', parentContact: '9812345678', address: '124, Hazratganj, Lucknow', email: 'aditya.verma@student.com' },
  { name: 'Reyansh Reddy', gender: 'Male', dob: '2011-04-25', parentName: 'Prasad Reddy', contact: '9123456789', parentContact: '9812345679', address: 'H.No. 8-2, Jubilee Hills, Hyderabad', email: 'reyansh.reddy@student.com' },

  // Class 11-A
  { name: 'Riya Sen', gender: 'Female', dob: '2010-06-12', parentName: 'Arup Sen', contact: '9123456790', parentContact: '9812345680', address: '5/1, Gariahat Road, Kolkata', email: 'riya.sen@student.com' },
  { name: 'Arjun Choudhury', gender: 'Male', dob: '2010-11-11', parentName: 'Bipul Choudhury', contact: '9123456791', parentContact: '9812345681', address: 'H.No. 12, Zoo Road, Guwahati', email: 'arjun.choudhury@student.com' },
  { name: 'Kiara Rao', gender: 'Female', dob: '2010-05-04', parentName: 'Satish Rao', contact: '9123456792', parentContact: '9812345682', address: 'Flat 5B, Skyline Apts, Mangalore', email: 'kiara.rao@student.com' },
  { name: 'Krishna Trivedi', gender: 'Male', dob: '2010-03-24', parentName: 'Nitin Trivedi', contact: '9123456793', parentContact: '9812345683', address: '22, Ratanlal Nagar, Kanpur', email: 'krishna.trivedi@student.com' },
  { name: 'Zara Khan', gender: 'Female', dob: '2010-09-15', parentName: 'Imran Khan', contact: '9123456794', parentContact: '9812345684', address: 'D-56, Aliganj, Lucknow', email: 'zara.khan@student.com' },
  { name: 'Dev Mukherjee', gender: 'Male', dob: '2010-07-29', parentName: 'Subir Mukherjee', contact: '9123456795', parentContact: '9812345685', address: '14, Ballygunge Circular Rd, Kolkata', email: 'dev.mukherjee@student.com' },
  { name: 'Kavya Mishra', gender: 'Female', dob: '2010-10-02', parentName: 'Prakash Mishra', contact: '9123456796', parentContact: '9812345686', address: 'Plot 89, Sector 4, Dwarka, Delhi', email: 'kavya.mishra@student.com' },
  { name: 'Rohan Saxena', gender: 'Male', dob: '2010-08-19', parentName: 'Anurag Saxena', contact: '9123456797', parentContact: '9812345687', address: 'H.No. 67, Civil Lines, Bareilly', email: 'rohan.saxena@student.com' },
  { name: 'Isha Malhotra', gender: 'Female', dob: '2010-01-08', parentName: 'Rakesh Malhotra', contact: '9123456798', parentContact: '9812345688', address: 'Flat 101, Green Glen Layout, Bangalore', email: 'isha.malhotra@student.com' },
  { name: 'Shreyas Bhat', gender: 'Male', dob: '2010-04-16', parentName: 'Ganesh Bhat', contact: '9123456799', parentContact: '9812345689', address: '44, Malleshwaram, Bangalore', email: 'shreyas.bhat@student.com' }
];

const days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'> = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
];

async function seedDatabase() {
  try {
    await connectDB();
    console.log('🧹 Dropping database for a clean seed...');
    await mongoose.connection.db!.dropDatabase();
    console.log('✅ Database dropped.');

    // 1. Create Admin User
    const admin = new User({
      username: 'admin',
      password: 'admin123',
      name: 'System Administrator',
      role: 'admin',
    });
    await admin.save();
    console.log('🔑 Admin user created: admin / admin123');

    // 2. Seed Teachers
    console.log('👩‍🏫 Seeding 20 Teachers...');
    const teachersData = SEED_TEACHERS.map((t, index) => ({
      ...t,
      employeeId: `T2026${String(index + 1).padStart(3, '0')}`,
      joiningDate: new Date('2024-06-01')
    }));
    const teachers = await Teacher.insertMany(teachersData);
    
    // Create Teacher user accounts
    for (const t of teachers) {
      const teacherUser = new User({
        username: t.employeeId,
        password: 'teacher123',
        name: t.name,
        role: 'teacher',
        teacherId: t._id,
      });
      await teacherUser.save();
    }
    console.log(`✅ ${teachers.length} Teachers and logins seeded.`);

    // 3. Seed Classes
    console.log('🏫 Seeding 2 Classes...');
    const class10 = new Class({
      name: 'Class 10',
      section: 'A',
      classTeacher: 'Dr. Rajesh Kumar',
      studentCount: 10
    });
    const class11 = new Class({
      name: 'Class 11',
      section: 'A',
      classTeacher: 'Sunita Deshmukh',
      studentCount: 10
    });
    await class10.save();
    await class11.save();
    console.log('✅ Classes seeded.');

    // 4. Seed Students
    console.log('🧑‍🎓 Seeding 20 Students...');
    const studentsData = SEED_STUDENTS.map((s, index) => {
      const isClass10 = index < 10;
      return {
        ...s,
        rollNo: `S2026${String(index + 1).padStart(3, '0')}`,
        class: isClass10 ? 'Class 10' : 'Class 11',
        section: 'A',
        dateOfBirth: new Date(s.dob),
        admissionDate: new Date('2025-04-10')
      };
    });
    const students = await Student.insertMany(studentsData);

    // Create Student user logins
    for (const s of students) {
      const studentUser = new User({
        username: s.rollNo,
        password: 'student123',
        name: s.name,
        role: 'student',
        studentId: s._id,
      });
      await studentUser.save();
    }
    console.log(`✅ ${students.length} Students and logins seeded.`);

    // 5. Seed Timetable
    console.log('📅 Seeding Timetable...');
    const getTeacherNameForSubject = (subject: string): string => {
      const teacher = teachers.find(t => t.subject === subject);
      return teacher ? teacher.name : 'Substitute Teacher';
    };

    const class10Subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'];
    const class11Subjects = ['Physics', 'Chemistry', 'Mathematics', 'Creative Writing', 'Economics'];

    const class10Periods = [
      { subject: 'Mathematics', startTime: '09:00 AM', endTime: '09:45 AM' },
      { subject: 'Physics', startTime: '09:50 AM', endTime: '10:35 AM' },
      { subject: 'Chemistry', startTime: '10:50 AM', endTime: '11:35 AM' },
      { subject: 'English', startTime: '11:40 AM', endTime: '12:25 PM' },
      { subject: 'Computer Science', startTime: '01:10 PM', endTime: '01:55 PM' },
    ];

    const class11Periods = [
      { subject: 'Physics', startTime: '09:00 AM', endTime: '09:45 AM' },
      { subject: 'Chemistry', startTime: '09:50 AM', endTime: '10:35 AM' },
      { subject: 'Mathematics', startTime: '10:50 AM', endTime: '11:35 AM' },
      { subject: 'Creative Writing', startTime: '11:40 AM', endTime: '12:25 PM' },
      { subject: 'Economics', startTime: '01:10 PM', endTime: '01:55 PM' },
    ];

    for (const day of days) {
      const t10 = new Timetable({
        class: 'Class 10',
        section: 'A',
        day,
        periods: class10Periods.map(p => ({
          subject: p.subject,
          teacher: getTeacherNameForSubject(p.subject),
          startTime: p.startTime,
          endTime: p.endTime
        }))
      });
      await t10.save();

      const t11 = new Timetable({
        class: 'Class 11',
        section: 'A',
        day,
        periods: class11Periods.map(p => ({
          subject: p.subject,
          teacher: getTeacherNameForSubject(p.subject),
          startTime: p.startTime,
          endTime: p.endTime
        }))
      });
      await t11.save();
    }
    console.log('✅ Timetable seeded.');

    // 6. Seed Subject-Wise Attendance (Last 5 Days)
    console.log('📝 Seeding Subject-wise Attendance records for the last 5 days...');
    const today = new Date();
    const attendanceRecords = [];

    const dates: Date[] = [];
    let tempDate = new Date(today);
    while (dates.length < 5) {
      tempDate.setDate(tempDate.getDate() - 1);
      const dayOfWeek = tempDate.getDay();
      if (dayOfWeek !== 0) { // Exclude Sunday
        dates.push(new Date(tempDate));
      }
    }

    for (const d of dates) {
      const normalizedDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      
      for (const student of students) {
        const subjects = student.class === 'Class 10' ? class10Subjects : class11Subjects;
        
        for (const sub of subjects) {
          const isLowAttendanceStudent = student.rollNo.endsWith('002') || student.rollNo.endsWith('012');
          const rand = Math.random();
          let status: 'Present' | 'Absent' | 'Late' = 'Present';
          
          if (isLowAttendanceStudent) {
            if (rand > 0.6) status = 'Absent';
            else if (rand > 0.45) status = 'Late';
          } else {
            if (rand > 0.96) status = 'Absent';
            else if (rand > 0.88) status = 'Late';
          }

          attendanceRecords.push({
            student: student._id.toString(),
            studentName: student.name,
            class: student.class,
            section: student.section,
            date: normalizedDate,
            status,
            subject: sub,
          });
        }
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`✅ ${attendanceRecords.length} Attendance records seeded.`);

    // 7. Seed Marks/Results
    console.log('📊 Seeding Marks/Results...');
    for (const student of students) {
      const subjects = student.class === 'Class 10' ? class10Subjects : class11Subjects;
      
      let performanceLevel: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement' = 'Good';
      const lastDigit = parseInt(student.rollNo.slice(-1));
      if (lastDigit === 1 || lastDigit === 3) performanceLevel = 'Excellent';
      else if (lastDigit === 4 || lastDigit === 7) performanceLevel = 'Average';
      else if (lastDigit === 8 || lastDigit === 2) performanceLevel = 'Needs Improvement';

      const subjectMarks = subjects.map(sub => {
        let marksObtained = 75;
        if (performanceLevel === 'Excellent') {
          marksObtained = Math.floor(Math.random() * 11) + 90;
        } else if (performanceLevel === 'Good') {
          marksObtained = Math.floor(Math.random() * 15) + 75;
        } else if (performanceLevel === 'Average') {
          marksObtained = Math.floor(Math.random() * 15) + 60;
        } else {
          if (sub === 'Mathematics' || sub === 'Physics') {
            marksObtained = Math.floor(Math.random() * 15) + 40;
          } else {
            marksObtained = Math.floor(Math.random() * 20) + 55;
          }
        }

        return {
          subject: sub,
          marksObtained,
          maxMarks: 100,
        };
      });

      const resRec = new Result({
        student: student._id,
        class: student.class,
        section: student.section,
        semester: 'Semester 1',
        subjectMarks,
        remarks: performanceLevel === 'Excellent' ? 'Keep it up!' : performanceLevel === 'Needs Improvement' ? 'Requires focus on core subjects.' : 'Good effort.',
      });
      await resRec.save();
    }
    console.log('✅ Semester 1 Results seeded.');

    // 8. Seed Fees
    console.log('💰 Seeding Fee records...');
    for (const student of students) {
      const rand = Math.random();
      let paidFee = 50000;
      const history = [];

      if (rand > 0.8) {
        paidFee = 0;
      } else if (rand > 0.5) {
        paidFee = 20000;
        history.push({ amount: 20000, date: new Date('2025-05-15'), paymentMethod: 'UPI' });
      } else {
        paidFee = 50000;
        history.push({ amount: 50000, date: new Date('2025-04-20'), paymentMethod: 'Card' });
      }

      const fee = new Fee({
        student: student._id,
        totalFee: 50000,
        paidFee,
        remainingFee: 50000 - paidFee,
        history,
        paymentDate: paidFee > 0 ? new Date() : undefined,
      });
      await fee.save();
    }
    console.log('✅ Fees seeded.');

    // 9. Seed Assignments & Submissions
    console.log('📝 Seeding Assignments & Submissions...');
    const assignmentsConfig = [
      { title: 'Algebra Practice Sheet', description: 'Complete all questions in Section A and B', class: 'Class 10', section: 'A', subject: 'Mathematics', dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000) },
      { title: 'Physics Lab Report', description: 'Write up experiment details for Newton\'s laws', class: 'Class 10', section: 'A', subject: 'Physics', dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) },
      { title: 'Economics Case Study', description: 'Analyze market dynamics of oil pricing', class: 'Class 11', section: 'A', subject: 'Economics', dueDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000) },
      { title: 'Mechanics Problems', description: 'Solve chapter 4 forces questions', class: 'Class 11', section: 'A', subject: 'Physics', dueDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) },
    ];

    for (const config of assignmentsConfig) {
      const teacher = teachers.find(t => t.subject === config.subject)?.name || 'Subject Teacher';
      
      const assignment = new Assignment({
        ...config,
        teacher,
      });
      await assignment.save();

      const classStudents = students.filter(s => s.class === config.class && s.section === config.section);
      for (const s of classStudents) {
        const isPastDue = config.dueDate < today;
        let status: 'Pending' | 'Submitted' | 'Late' | 'Evaluated' = 'Pending';
        let submittedAt = undefined;
        let score = undefined;
        let grade = undefined;
        let feedback = undefined;

        if (isPastDue) {
          const rand = Math.random();
          if (rand > 0.3) {
            status = 'Evaluated';
            submittedAt = new Date(config.dueDate.getTime() - 12 * 60 * 60 * 1000);
            score = Math.floor(Math.random() * 21) + 80;
            grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : 'B';
            feedback = 'Good work!';
          } else if (rand > 0.1) {
            status = 'Submitted';
            submittedAt = new Date(config.dueDate.getTime() - 6 * 60 * 60 * 1000);
          } else {
            status = 'Pending';
          }
        } else {
          const rand = Math.random();
          if (rand > 0.7) {
            status = 'Submitted';
            submittedAt = new Date();
          } else {
            status = 'Pending';
          }
        }

        await Submission.create({
          assignment: assignment._id,
          student: s._id,
          studentName: s.name,
          rollNo: s.rollNo,
          status,
          submittedAt,
          score,
          grade,
          feedback,
        });
      }
    }
    console.log('✅ Assignments and Submissions seeded.');

    // 10. Seed Notifications
    console.log('🔔 Seeding Notifications...');
    await Notification.create({
      title: 'Annual Sports Meet 2026',
      message: 'The annual sports meet will commence on October 15th. Registration starts next Monday.',
      type: 'General',
      targetRole: 'all',
      isRead: false,
    });

    await Notification.create({
      title: 'Mid-Term Exams Schedule',
      message: 'Mid-term examinations are scheduled from September 10th. Timetable has been updated in the portal.',
      type: 'Exam',
      targetRole: 'all',
      isRead: false,
    });

    for (const student of students) {
      const fee = await Fee.findOne({ student: student._id });
      if (fee && fee.paymentStatus === 'Pending') {
        await Notification.create({
          title: 'Fee Payment Pending',
          message: 'Your tuition fees for Semester 1 are pending. Please pay at your earliest to avoid penalties.',
          type: 'Pending Fee',
          targetRole: 'student',
          student: student._id,
          isRead: false,
        });
      }

      const records = attendanceRecords.filter(a => a.student === student._id.toString());
      const present = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
      const pct = records.length > 0 ? (present / records.length) * 100 : 0;
      if (pct < 75) {
        await Notification.create({
          title: 'Low Attendance Warning',
          message: `Your current attendance is ${Math.round(pct)}%, which is below the required 75%. Please attend classes regularly.`,
          type: 'Low Attendance',
          targetRole: 'student',
          student: student._id,
          isRead: false,
        });
      }
    }
    console.log('✅ Notifications seeded.');
    console.log('🎉 Seeding successfully completed!');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
}

seedDatabase();
