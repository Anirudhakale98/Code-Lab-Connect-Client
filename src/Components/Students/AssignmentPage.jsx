import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Paper,
  TextField,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import MonacoEditor from "@monaco-editor/react";
import { useTheme } from "@mui/material/styles";
import axiosInstance from "../../utils/axiosInstance.js";
import { useNavigate, useParams } from "react-router-dom";

const initialCode = {
  java: 'public class Main {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello, World!");\n\t}\n}',
  python: 'print("Hello, World!")',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n\tcout << "Hello, World!";\n\treturn 0;\n}'
};

const AssignmentPage = () => {
  const { id: classroomId, assignmentId } = useParams();
  const [language, setLanguage] = useState("java");
  const [theme, setTheme] = useState("dark");
  const [code, setCode] = useState(initialCode[language]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [currAssignment, setCurrAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const navigate = useNavigate();
  const themeMode = useTheme();

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = (await axiosInstance.get(`/api/v1/students/classes/${classroomId}/assignments/${assignmentId}`)).data;
        // console.log("Assignment:", response.data.assignment); 
        setCurrAssignment(response.data.assignment);
      } catch (error) {
        console.error("Error fetching assignment:", error);
        setSnackbar({ open: true, message: "Failed to fetch assignment details.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [classroomId, assignmentId]);

  const handleThemeChange = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    setCode(initialCode[newLanguage]); // Reset code to the default template
  };

  const handleRunCode = async () => {
    try {
      setOutput("Running code...");
      const response = (await axiosInstance.post(`/api/v1/students/classes/${classroomId}/assignments/${assignmentId}/run-code`, {
        language,
        code,
        input
      })).data;

      setOutput(response.data.output);
      setSnackbar({ open: true, message: "Code executed successfully!", severity: "success" });
    } catch (error) {
      console.error("Error running code:", error);
      setOutput("Error running code.");
      setSnackbar({ open: true, message: "Failed to run code.", severity: "error" });
    }
  };

  const handleSubmit = async () => {
    try {
      await axiosInstance.post(`/api/v1/students/classes/${classroomId}/assignments/${assignmentId}/submit`, {
        code,
        language,
        input
      });
      setSnackbar({ open: true, message: "Assignment submitted successfully!", severity: "success" });
      navigate(`/students/classes/${classroomId}`);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setSnackbar({ open: true, message: "Error submitting assignment.", severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ minHeight: "100vh", backgroundColor: theme === "light" ? "#f5f5f5" : "#2c2c2c", p: 3 }}>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: "10px", backgroundColor: themeMode.palette.background.paper }}>
          <Typography variant="h4" gutterBottom>{currAssignment?.title}</Typography>
          <Typography variant="body1" gutterBottom sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
            {currAssignment?.description}
          </Typography>
          {currAssignment?.example && (
            <Typography variant="body1" gutterBottom sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
              <strong>Example:</strong>
              <br/>
              Input: {currAssignment.example.input}
              <br/>
              Output: {currAssignment.example.output}
            </Typography>
          )}
          <TextField
            label="Input"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
            placeholder="Input data here"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <TextField
            label="Output"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
            placeholder="Output will appear here"
            value={output}
            InputProps={{ readOnly: true }}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: "10px", backgroundColor: themeMode.palette.background.paper }}>
          <Box display="flex" justifyContent="space-between" sx={{ mb: 2 }}>
            <FormControl variant="outlined" sx={{ minWidth: 150 }}>
              <InputLabel>Language</InputLabel>
              <Select value={language} onChange={handleLanguageChange} label="Language">
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="java">Java</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleThemeChange} color="primary">
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </Button>
          </Box>

          <MonacoEditor
            height="400px"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme={theme === "light" ? "light" : "vs-dark"}
            options={{ minimap: { enabled: false }, lineNumbers: "on", fontSize: 14, autoIndent: "full" }}
          />

          <Box display="flex" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button variant="contained" color="success" onClick={handleRunCode}>Run Code</Button>
            <Button variant="contained" color="error" onClick={handleSubmit}>Submit</Button>
          </Box>
        </Paper>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default AssignmentPage;
