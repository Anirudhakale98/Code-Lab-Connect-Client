import React, { useState, useEffect } from "react";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    FormLabel,
    IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import Dashboard from "../Dashboard";
import DeleteIcon from "@mui/icons-material/Delete";

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

const ClassroomPageT = () => {
    const { classroomId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ title: "", description: "", deadline: "", exampleInput: "", exampleOutput: "" });
    const [currClass, setCurrClass] = useState(null);
    const [currUser, setCurrUser] = useState(null);
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClassData = async () => {
            try {
                const user = (await axiosInstance.get("/api/v1/users/me")).data;
                setCurrUser(user.data.user);

                const classRes = (await axiosInstance.get("/api/v1/teachers/classes")).data;
                setClasses(classRes.data.classes);

                const currClassroom = (await axiosInstance.get(`/api/v1/teachers/classes/${classroomId}`)).data;
                setCurrClass(currClassroom.data.classroom);

                const assignmentsRes = (await axiosInstance.get(`/api/v1/teachers/classes/${classroomId}/assignments`)).data;
                setAssignments(assignmentsRes.data.assignments);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchClassData();
    }, [classroomId]);

    const handleOpenDialog = () => setIsDialogOpen(true);

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setNewAssignment({ title: "", description: "", deadline: "", exampleInput: "", exampleOutput: "" });
        setError("");
    };

    const handleAddAssignment = async () => {
        if (!newAssignment.title.trim() || !newAssignment.description.trim() || !newAssignment.deadline) {
            setError("Title, Description, and Deadline are required.");
            return;
        }

        try {
            const res = (await axiosInstance.post(`/api/v1/teachers/classes/${classroomId}/assignments`, newAssignment)).data;
            setAssignments([...assignments, res.data.assignments]);
            handleCloseDialog();
        } catch (error) {
            console.error("Error adding assignment:", error);
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (!window.confirm("Are you sure you want to delete this assignment?")) return;

        try {
            await axiosInstance.post(`/api/v1/teachers/classes/${classroomId}/assignments/${assignmentId}/delete`);
            setAssignments(assignments.filter((assignment) => assignment._id !== assignmentId));
        } catch (error) {
            console.error("Error deleting assignment:", error);
        }
    };

    if (!currClass) return <Typography>Loading...</Typography>;

    return (
        <Box display="flex">
            <Dashboard user={currUser} classes={classes} />

            <Box flexGrow={1} p={3} sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
                <StyledCard>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        {currClass.title} 
                    </Typography>
                    <Typography variant="subtitle1">{currClass.description}</Typography>
                    <Typography variant="subtitle1">Code: {currClass.classroomId}</Typography>
                </StyledCard>

                <Box mt={4}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            Assignments
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ background: "linear-gradient(135deg, #0288d1, #0277bd)", color: "#fff" }}
                            onClick={handleOpenDialog}
                        >
                            + Add Assignment
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {assignments.map((assignment) => (
                            <Grid item xs={12} sm={6} md={4} key={assignment?._id}>
                                <Card
                                    sx={{
                                        background: "#0288d1",
                                        color: "#fff",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                        '&:hover': { boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)" },
                                        position: "relative",
                                    }}
                                >
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteAssignment(assignment._id);
                                        }}
                                        sx={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                            color: "white",
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    <CardContent onClick={() => navigate(`/teachers/classes/${classroomId}/assignments/${assignment?._id}`)}>
                                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                            {assignment?.title}
                                        </Typography>
                                        <Typography variant="body2">{assignment?.description}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Add Assignment Dialog */}
                <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                    <DialogTitle>Add New Assignment</DialogTitle>
                    <DialogContent>
                        {error && (
                            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                                {error}
                            </Typography>
                        )}
                        <TextField autoFocus margin="dense" label="Assignment Title" fullWidth value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} />
                        <TextField margin="dense" label="Assignment Description" fullWidth multiline rows={4} value={newAssignment.description} onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} />
                        <FormControl fullWidth margin="dense">
                            <FormLabel>Deadline</FormLabel>
                            <TextField type="datetime-local" value={newAssignment.deadline || ""} onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })} inputProps={{ min: new Date().toISOString().split("T")[0] + "T00:00" }} />
                        </FormControl>
                        <TextField margin="dense" label="Example Input" fullWidth value={newAssignment.exampleInput} onChange={(e) => setNewAssignment({ ...newAssignment, exampleInput: e.target.value })} />
                        <TextField margin="dense" label="Example Output" fullWidth value={newAssignment.exampleOutput} onChange={(e) => setNewAssignment({ ...newAssignment, exampleOutput: e.target.value })} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
                        <Button onClick={handleAddAssignment} sx={{ backgroundColor: "#0288d1", color: "#fff" }}>Add</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default ClassroomPageT;
