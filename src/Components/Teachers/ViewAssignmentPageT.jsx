import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  CircularProgress,
  TextField,
  Button
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";

const ViewAssignmentPageT = () => {
  const [loading, setLoading] = useState(true);
  const [currStudent, setCurrStudent] = useState(null);
  const [currAssignment, setCurrAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [marks, setMarks] = useState("");
  const { classroomId, assignmentId, studentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      try {
        const studentResponse = (await axiosInstance.get(`/api/v1/users/${studentId}`)).data;
        setCurrStudent(studentResponse.data.user);

        const assignmentResponse = (await axiosInstance.get(
          `/api/v1/teachers/classes/${classroomId}/assignments/${assignmentId}`
        )).data;
        setCurrAssignment(assignmentResponse.data.assignment);

        const submissionResponse = await axiosInstance.get(
          `/api/v1/students/classes/${classroomId}/assignments/${assignmentId}/submissions/${studentId}`
        );
        setSubmission(submissionResponse.data.data.submission);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [classroomId, assignmentId, studentId]);

  const handleMarksChange = (e) => {
    setMarks(e.target.value);
  };

  const submitMarks = async () => {
    if (!marks) {
      alert("Please enter marks");
      return;
    }
    try {
      await axiosInstance.post(
        `/api/v1/teachers/classes/${classroomId}/assignments/${assignmentId}/submissions/${submission._id}/marks`,
        { marks }
      );
      alert("Marks submitted successfully");
      // console.log(`/teacher/classes/${classroomId}/assignments/${assignmentId}`);
      navigate(`/teachers/classes/${classroomId}/assignments/${assignmentId}`);
    } catch (error) {
      console.error("Error submitting marks:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", minHeight: "100vh", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currStudent || !currAssignment || !submission) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", minHeight: "100vh", alignItems: "center" }}>
        <Typography variant="h6" color="error">
          Error loading data
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", width: "100%" }}>
      <Grid container spacing={3} sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", p: 3, width: "50%" }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: "10px", backgroundColor: "#ffffff" }}>
            <Typography variant="h4" gutterBottom align="center">
              Assignment Report
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* User Information Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                User Information
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>First Name:</TableCell>
                      <TableCell>{currStudent.firstName}</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Last Name:</TableCell>
                      <TableCell>{currStudent.lastName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Email:</TableCell>
                      <TableCell>{currStudent.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>PRN:</TableCell>
                      <TableCell>{currStudent.prn}</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Roll No:</TableCell>
                      <TableCell>{currStudent.rollNo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Marks Obtained:</TableCell>
                      <TableCell>{submission.marks ? submission.marks : "Not Graded Yet"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Assignment Details Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Assignment Details
              </Typography>
              <Typography variant="h6" gutterBottom>
                Title: {currAssignment.title} {submission.marks && <span>({submission.marks} marks)</span>}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Assignment Description: <br />
                {currAssignment.description}
              </Typography>
            </Box>

            {/* Code Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Code
              </Typography>
              <Paper elevation={2} sx={{ p: 2, backgroundColor: "#f9f9f9", fontFamily: "monospace", whiteSpace: "pre-wrap", overflowX: "auto" }}>
                {submission.submission.code}
              </Paper>
            </Box>

            {/* Input and Output Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Input
              </Typography>
              <Paper elevation={2} sx={{ p: 2, backgroundColor: "#f9f9f9" }}>
                {submission.submission.input}
              </Paper>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                Output
              </Typography>
              <Paper elevation={2} sx={{ p: 2, backgroundColor: "#f9f9f9" }}>
                {submission.submission.output}
              </Paper>
            </Box>

            {/* Marks Input and Submit Button */}
            <Box sx={{ mt: 3 }}>
              <TextField
                label="Marks"
                variant="outlined"
                fullWidth
                value={marks}
                onChange={handleMarksChange}
              />
              <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={submitMarks}>
                Submit Marks
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewAssignmentPageT;
