import React, { useState, useEffect } from "react";
import { styled } from "@mui/system";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import Dashboard from "../Dashboard";



// Styled Components
const StyledCard = styled(Card)({
  background: "linear-gradient(135deg, #607d8b, #455a64)",
  color: "white",
  borderRadius: "15px",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});


const AssignmentPageT = () => {
  const { classroomId, assignmentId } = useParams();
  const [user, setUser] = useState({});
  const [classes, setClasses] = useState([]);
  const [currClass, setCurrClass] = useState({});
  const [currAssignment, setCurrAssignment] = useState({});
  const [submittedStudents, setSubmittedStudents] = useState([]);
  const [notSubmittedStudents, setNotSubmittedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = (await axiosInstance.get("/api/v1/users/me")).data;
        // console.log("userRes: ", userRes);
        setUser(userRes.data.user);

        const classesRes = (await axiosInstance.get("/api/v1/teachers/classes")).data;
        setClasses(classesRes.data.classes);

        const currClassRes = (await axiosInstance.get(`/api/v1/teachers/classes/${classroomId}`)).data;
        setCurrClass(currClassRes.data.classroom);

        const currAssignmentRes = (await axiosInstance.get(`/api/v1/teachers/classes/${classroomId}/assignments/${assignmentId}`)).data;
        // console.log("Assignment: ", currAssignmentRes.data.assignment);
        setCurrAssignment(currAssignmentRes.data.assignment);
        
        const submittedStudentsRes = (await axiosInstance.get(`/api/v1/teachers/classes/${classroomId}/assignments/${assignmentId}/students`)).data;
        // console.log("Submitted Students: ", submittedStudentsRes.data.students);
        setSubmittedStudents(submittedStudentsRes.data.students || []);

        const notSubmittedStudentsRes = (await axiosInstance.get(`/api/v1/teachers/classes/${classroomId}/assignments/${assignmentId}/notSubmittedStudents`)).data;
        // console.log("Not Submitted Students: ", notSubmittedStudentsRes.data.students); 
        setNotSubmittedStudents(notSubmittedStudentsRes.data.students || []);
        

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classroomId, assignmentId]);

  if (loading) {
    return <Typography>Loading data...</Typography>;
  }
  

  return (
    <Box display="flex">
      <Dashboard user={user} classes={classes} />
      <Box flexGrow={1} p={3} sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <StyledCard>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
          {currClass.title}
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Assignment Title: {currAssignment.title}
        </Typography>
        </StyledCard>

        <Grid container spacing={4} mt={4}>
          {/* Submitted Students */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: "10px", boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)" }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                  Submitted Assignments
                </Typography>
                <List>
                  {submittedStudents.length > 0 ? (
                    submittedStudents.map((student) => (
                      <React.Fragment key={student.id}>
                        <ListItem button component={Link} to={`/teachers/classes/${classroomId}/assignments/${assignmentId}/view/${student._id}`}>
                          <ListItemText
                            primary={<Typography sx={{ fontWeight: "bold", color: "#2e7d32" }}>{student.name}</Typography>}
                            secondary={`PRN: ${student.prn} | Roll No: ${student.rollNo}`}
                          />
                          <ListItemText primary={"View assignment"} />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))
                  ) : (
                    <Typography color="textSecondary" sx={{ ml: 2 }}>
                      No submissions yet.
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Not Submitted Students */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: "10px", boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)" }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                  Not Submitted Assignments
                </Typography>
                <List>
                  {notSubmittedStudents.length > 0 ? (
                    notSubmittedStudents.map((student) => (
                      <React.Fragment key={student.id}>
                        <ListItem>
                          <ListItemText
                            primary={<Typography sx={{ fontWeight: "bold", color: "#d32f2f" }}>{student.name}</Typography>}
                            secondary={`PRN: ${student.prn} | Roll No: ${student.rollNo} `}
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))
                  ) : (
                    <Typography color="textSecondary" sx={{ ml: 2 }}>
                      All students have submitted.
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AssignmentPageT;
