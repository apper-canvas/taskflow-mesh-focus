import { createBrowserRouter } from "react-router-dom";
import React, { Suspense } from "react";
import { getRouteConfig } from "./route.utils";

// Lazy load page components
const Dashboard = React.lazy(() => import('@/components/pages/Dashboard'))
const ProjectList = React.lazy(() => import('@/components/pages/ProjectList'))
const ProjectCreate = React.lazy(() => import('@/components/pages/ProjectCreate'))
const ProjectDetail = React.lazy(() => import('@/components/pages/ProjectDetail'))
const ProjectSettings = React.lazy(() => import('@/components/pages/ProjectSettings'))
const ProjectTimeline = React.lazy(() => import('@/components/pages/ProjectTimeline'))
const TaskCreate = React.lazy(() => import('@/components/pages/TaskCreate'))
const NotificationCenter = React.lazy(() => import('@/components/pages/NotificationCenter'))
const NotificationPreferences = React.lazy(() => import('@/components/pages/NotificationPreferences'))
const Templates = React.lazy(() => import('@/components/pages/Templates'))
const NotFound = React.lazy(() => import('@/components/pages/NotFound'))

// Authentication pages
const Login = React.lazy(() => import('@/components/pages/auth/Login'))
const Signup = React.lazy(() => import('@/components/pages/auth/Signup'))
const Callback = React.lazy(() => import('@/components/pages/auth/Callback'))
const ErrorPage = React.lazy(() => import('@/components/pages/auth/ErrorPage'))
const ResetPassword = React.lazy(() => import('@/components/pages/auth/ResetPassword'))
const PromptPassword = React.lazy(() => import('@/components/pages/auth/PromptPassword'))

// Layouts
const Root = React.lazy(() => import('@/layouts/Root'))
const Layout = React.lazy(() => import('@/components/organisms/Layout'))

const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  // Get config for this route
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`;
  }

  const config = getRouteConfig(configPath);
  const finalAccess = access || config?.allow;

  const route = {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  </div>}>{element}</Suspense> : element,
    handle: {
      access: finalAccess,
      ...meta,
    },
  };

  if (children && children.length > 0) {
    route.children = children;
  }

  return route;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      // Authentication routes
      createRoute({
        path: "login",
        element: <Login />
      }),
      createRoute({
        path: "signup", 
        element: <Signup />
      }),
      createRoute({
        path: "callback",
        element: <Callback />
      }),
      createRoute({
        path: "error",
        element: <ErrorPage />
      }),
      createRoute({
        path: "prompt-password/:appId/:emailAddress/:provider",
        element: <PromptPassword />
      }),
      createRoute({
        path: "reset-password/:appId/:fields",
        element: <ResetPassword />
      }),
      
      // Main application routes
      {
        path: "",
        element: <Layout />,
        children: [
          createRoute({
            index: true,
            element: <Dashboard />
          }),
          createRoute({
            path: "projects",
            element: <ProjectList />
          }),
          createRoute({
            path: "projects/create",
            element: <ProjectCreate />
          }),
          createRoute({
            path: "projects/:id",
            element: <ProjectDetail />
          }),
          createRoute({
            path: "projects/:id/settings",
            element: <ProjectSettings />
          }),
          createRoute({
            path: "projects/:id/timeline",
            element: <ProjectTimeline />
          }),
          createRoute({
            path: "tasks/create",
            element: <TaskCreate />
          }),
          createRoute({
            path: "notifications",
            element: <NotificationCenter />
          }),
          createRoute({
            path: "notifications/preferences", 
            element: <NotificationPreferences />
          }),
          createRoute({
            path: "templates",
            element: <Templates />
          }),
          createRoute({
            path: "*",
            element: <NotFound />
          })
        ]
      }
    ]
  }
]);