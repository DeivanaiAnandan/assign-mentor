const express = require('express');
const { MongoClient,  ObjectId } = require('mongodb');
const DB_URL = process.env.DB_URL;
const router = express.Router();

router.get('/', (req,res)=>{
    res.send('<h1>Hi from student</h1>')
})

//2.Write API to create Student

router.post('/create-student',async (req,res)=>{
    try {
        const {studentName, studentEmail}=req.body;
        const connection = await MongoClient.connect(DB_URL);
        const db = connection.db('zenclass');
        const student = db.collection('students').insertOne({
            studentName: studentName,
            studentEmail: studentEmail,
            oldMentor: null,
            newMentor: null
        })
        res.send({
            message: 'Student created successfully'
            
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
          message : 'Something went wrong'
        })
    }

})

//APi to fetch all students

router.get('/students', async (req,res)=>{
    try {

        const connection = await MongoClient.connect(DB_URL)
        const db = connection.db('zenclass');
        const studentsDetails = await db.collection("students").find({}).toArray();
        connection.close();
        res.send(studentsDetails);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error" });
    }
})

// 3. Write API to Assign a student to Mentor
// a)Select a mentor and Add multiple Students

router.post("/assignStudToMentor", async (req, res) => {
    try {
      const {mentorId,studentId} = req.body;
      const mentorObjId = new ObjectId(mentorId);
      const studentObjId = new ObjectId(studentId);
      const connection = await MongoClient.connect(DB_URL);
      const db = connection.db("zenclass");
      const mentorsCollection = db.collection("mentors");
      const studentsCollection = db.collection("students");
      const mentor = await mentorsCollection.findOne({ _id: mentorObjId });
      const student = await studentsCollection.findOne({ _id: studentObjId });
      if (!mentor || !student) {
        res.status(404).send({ error: "Mentor or student not found" });
        return;
      }
       // UPDATE PARTICULAR STUDENT
    await studentsCollection.updateOne(
        { _id: studentObjId },
        { $set: { oldMentor: student.newMentor, newMentor: mentor.mentorName } }
      );
      //ASSIGN MENTOR
      await mentorsCollection.updateOne(
        { _id: mentorObjId },
        { $push: { students: { studentName: student.studentName, studentEmail: student.studentEmail, studentId: studentObjId } } }
      );
      connection.close();
      res.send({
        success: true,
        message: 'Mentor is assigned',
        mentorName: mentor.mentorName
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

//b)API to A student who has a mentor should not be shown in List

router.get("/students-no-mentors", async (req, res) => {
    try {
      const connection = await MongoClient.connect(DB_URL);
      const db = connection.db("zenclass");
      const studentsDetails = await db.collection("students").find({
        oldMentor: { $eq: null },
        newMentor: { $eq: null }
      }).toArray();
      const students = studentsDetails.map((item) => ({
        studentId: item._id.toString(),
        studentName: item.studentName,
        studentEmail: item.studentEmail,
        oldMentor: item.oldMentor,
        newMentor: item.newMentor
      }));
      connection.close();
  
      if (students.length > 0) {
        res.send(students);
      } else {
        res.send({ message: "No students with both oldMentor and currentMentor found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

  // 6. Write API to show the previously assigned mentor for a particular student
router.get("/oldmentor/:studentName", async (req, res) => {
    try {
      const {studentName} = req.params;
      const connection = await MongoClient.connect(DB_URL);
      const db = connection.db("zenclass");
      const studentsCollection = db.collection("students");
      const student = await studentsCollection.findOne({ studentName: studentName });
      if(student.oldMentor === null) {
        res.send({
          message : 'No older mentor for this student'
        })
      }else{
        res.send({ oldMentor: student.oldMentor })
      }
    } catch (error) {
      console.log(error)
    }
  })

module.exports = router;

