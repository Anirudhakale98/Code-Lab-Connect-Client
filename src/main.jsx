import React, { createElement } from 'react'
import { Route, Navigate } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import {ClassroomPage, Classroom, AssignmentPage, ViewAssignmentPage} from './Components/Students/index.jsx'
import {ClassroomT,ClassroomPageT,AssignmentPageT, ViewAssignmentPageT} from './Components/Teachers/index.jsx'
import LoginPage from './Components/LoginPage.jsx'
import RegisterPage from './Components/RegisterPage.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" >
      <Route index element={<Navigate to="/login"/>} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="tour" element={<Navigate to="/" />} />
      <Route path="students/">
        <Route index element={<Classroom />} />
        <Route path="classes/">
          <Route path=":id/" element={<ClassroomPage />} />
          <Route path=":id/assignments/">
            <Route path=":assignmentId/"  >
              <Route path="solve" element={<AssignmentPage />} />
              <Route path="view" element={<ViewAssignmentPage />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="teachers/">
        <Route index element={<ClassroomT />} />
        <Route path="classes/">
          <Route path=":classroomId" element={<ClassroomPageT />} />
          <Route path=":classroomId/assignments/:assignmentId/" >
            <Route index element={<AssignmentPageT />} />
            <Route path="view/:studentId" element={<ViewAssignmentPageT />} />
          </Route>
        </Route>
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvider router = {router}/>
  </React.StrictMode>,
)
