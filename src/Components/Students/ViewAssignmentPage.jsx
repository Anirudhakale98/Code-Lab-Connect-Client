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
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const ViewAssignmentPage = () => {
  const [loading, setLoading] = useState(true);
  const [currStudent, setCurrStudent] = useState(null);
  const [currAssignment, setCurrAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const { id: classroomId, assignmentId } = useParams();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        // Fetch student details
        const studentResponce = await axiosInstance.get(`/api/v1/users/me`);
        // console.log("Student:", studentResponce.data.data.user); // Debug
        setCurrStudent(studentResponce.data.data.user);
        const studentId = studentResponce.data.data.user._id;

        // Fetch assignment details
        const assignmentResponse = await axiosInstance.get(
          `/api/v1/students/classes/${classroomId}/assignments/${assignmentId}`
        );
        // console.log("Assignment:", assignmentResponse.data.data.assignment); // Debug
        setCurrAssignment(assignmentResponse.data.data.assignment);

        // Fetch submission details
        const submissionResponse = await axiosInstance.get(
          `/api/v1/students/classes/${classroomId}/assignments/${assignmentId}/submissions/${studentId}`, 
        );
        // console.log("Submission:", submissionResponse.data.data.submission); // Debug
        setSubmission(submissionResponse.data.data.submission);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [classroomId, assignmentId]);

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
          Submission not found! 
          <br/>
        <Button onClick={() => window.history.back()} variant="contained" color="primary">
          Go Back
        </Button>
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Grid container spacing={3} sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", p: 3, width: "50%" }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: "10px", backgroundColor: "#ffffff" }}>
            <Typography variant="h4" gutterBottom align="center">
              Assignment Report
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* User Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                User Information
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                        First Name:
                      </TableCell>
                      <TableCell>{`${currStudent.firstName}`}</TableCell>
                      <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                        Last Name:
                      </TableCell>
                      <TableCell>{`${currStudent.lastName}`}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                        Email
                      </TableCell>
                      <TableCell>{currStudent.email}</TableCell>
                    </TableRow>
                    <TableRow>
                    <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                        PRN 
                      </TableCell>
                      <TableCell>{`${currStudent.prn}`}</TableCell>
                      <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                        Roll No
                      </TableCell>
                      <TableCell>{`${currStudent.rollNo}`}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Assignment Details */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Assignment Details
              </Typography>
              <Typography variant="h6" gutterBottom>
                Title: {currAssignment.title} {submission.marks && <span>Marks: ({submission.marks} marks)</span>}
                {"\n\n"}
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
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  backgroundColor: "#f9f9f9",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  overflowX: "auto",
                }}
              >
                {submission.submission.code}
              </Paper>
            </Box>

            {/* Input and Output */}
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewAssignmentPage;
