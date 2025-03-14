import React, { useState, useEffect } from "react";
import {
    AppBar,
    Toolbar,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
} from "@mui/material";
import { styled } from "@mui/system";
import { Link, useParams } from "react-router-dom";
import Dashboard from "../Dashboard";
import axiosInstance from "../../utils/axiosInstance.js";

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

const ClassroomPage = () => {
    const { id: classroomId } = useParams();
    const [classes, setClasses] = useState([]);
    const [currClass, setCurrClass] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, classesRes, classRes, assignmentsRes] = await Promise.all([
                    axiosInstance.get("/api/v1/users/me"),
                    axiosInstance.get("/api/v1/students/classes"),
                    axiosInstance.get(`/api/v1/students/classes/${classroomId}`),
                    axiosInstance.get(`/api/v1/students/classes/${classroomId}/assignments`)
                ]);

                setUser(userRes.data?.data?.user);
                setClasses(classesRes.data?.data || []);
                setCurrClass(classRes.data?.data?.classroom);
                setAssignments(assignmentsRes.data?.data?.assignments || []);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load classroom data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [classroomId]);

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!currClass) return <Typography>Classroom not found.</Typography>;
    if (!user) return <Typography>User not found.</Typography>;

    return (
        <Box display="flex">
            <Dashboard user={user} classes={classes} />
            <Box flexGrow={1} p={3} sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
                {/* Classroom Details */}
                <StyledCard>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        {currClass.title}
                    </Typography>
                    <Typography variant="subtitle1">{currClass.description}</Typography>
                </StyledCard>

                {/* Assignments List */}
                <Box mt={4}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
                        Assignments
                    </Typography>
                    <Grid container spacing={3}>
                        {assignments.length > 0 ? (
                            assignments.map((assignment) => (
                                <Grid item xs={12} sm={6} md={4} key={assignment._id}>
                                    <Card
                                        sx={{
                                            background: "#0288d1",
                                            color: "#fff",
                                            borderRadius: "10px",
                                            boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
                                        }}
                                    >
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                                {assignment.title}
                                            </Typography>
                                            <Typography variant="body2">{assignment.description}</Typography>
                                            <Box mt={2} display="flex" justifyContent="space-between">
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    size="small"
                                                    component={Link}
                                                    to={`/students/classes/${currClass.classroomId}/assignments/${assignment._id}/solve`}
                                                >
                                                    Solve
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    size="small"
                                                    component={Link}
                                                    to={`/students/classes/${currClass.classroomId}/assignments/${assignment._id}/view`}
                                                >
                                                    View
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        ) : (
                            <Typography>No assignments available.</Typography>
                        )}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};

export default ClassroomPage;
