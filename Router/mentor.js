const express = require('express');
const { MongoClient, ObjectId} = require('mongodb');
const DB_URL = process.env.DB_URL;
const router = express.Router();

router.get('/', (req,res)=>{
    res.send('<h1>Hi from mentor</h1>')
})

// 1. write API to create Mentor
router.post('/create-mentor',async (req,res)=>{
    try {
        const {mentorName, mentorEmail}=req.body;
        const connection = await MongoClient.connect(DB_URL);
        const db = connection.db('zenclass');
        const mentor = db.collection('mentors').insertOne({
            mentorName: mentorName,
            mentorEmail: mentorEmail,
            students: []
        })
        res.send({
            message: 'Mentor created successfully'
            
        });

    } catch (error) {
        res.status(500).json({
          message : 'Something went wrong'
        })
    }

})

//APi to fetch all mentors

router.get('/mentors', async (req,res)=>{
    try {

        const connection = await MongoClient.connect(DB_URL)
        const db = connection.db('zenclass');
        const mentorsDetails = await db.collection("mentors").find({}).toArray();
        connection.close();
        res.send(mentorsDetails);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error" });
    }
})

// 4. Write API to Assign or Change Mentor for particular Student
// Select a Student and Assign a Mentor
router.post("/change-mentor", async (req, res) => {
    try {
      const {mentorId,studentId,newMentor:newcurrentMentor}=req.body
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
      await studentsCollection.updateOne(
        { _id: studentObjId },
        { $set: { oldMentor: student.newMentor, newMentor: newcurrentMentor } }
      );
      await mentorsCollection.updateOne(
        { _id: mentorObjId },
        { $push: { students: { studentName: student.studentName, studentEmail: student.studentEmail, studentId: studentObjId } } }
      );
      connection.close();
      res.send({ success: true, message : 'Mentor is changed for this student' });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  });

// 5. Write API to show all students for a particular mentor
router.get("/:mentorName/students", async (req, res) => {

    try {
      const mentorName = req.params.mentorName;
      const connection = await MongoClient.connect(DB_URL);
      const db = connection.db("zenclass");
      const mentorsCollection = db.collection("mentors");
      const mentor = await mentorsCollection.findOne({mentorName:mentorName});
  
      res.send(mentor.students)
    } catch (error) {
      console.log(error)
    }
  })

module.exports = router;
