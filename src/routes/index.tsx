import type { ComponentType, ReactNode } from 'react';
import { Route } from 'react-router-dom';

// Layouts
import NothingLayout from '@/components/layouts/NothingLayout';
import SidebarLayout from '@/components/layouts/SidebarLayout';

// Pages
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import LoginPage from '@/pages/LoginPage';
import StudentPage from '@/pages/StudentPage';
import NotificationsPage from '@/pages/NotificationsPage';
import EducationalProgramPage from '@/pages/EducationalProgramPage';
import ClassSchedulePage from '@/pages/ClassSchedulePage';
import ExamSchedulePage from '@/pages/ExamSchedulePage';
import DecisionsPage from '@/pages/DecisionsPage';
import AttendancePage from '@/pages/AttendancePage';
import ConductScorePage from '@/pages/ConductScorePage';
import AcademicResultsPage from '@/pages/AcademicResultsPage';
import FinancePage from '@/pages/FinancePage';
import CourseRegistrationResultsPage from '@/pages/CourseRegistrationResultsPage';
import CourseEquivalencyPage from '@/pages/CourseEquivalencyPage';
import GraduationPage from '@/pages/GraduationPage';
import DiscussionPage from '@/pages/DiscussionPage';
import ConductAssessmentPage from '@/pages/ConductAssessmentPage';
import CommunityServicePage from '@/pages/CommunityServicePage';
import CertificatesPage from '@/pages/CertificatesPage';
import ScholarshipPage from '@/pages/ScholarshipPage';
import RegistrationPage from '@/pages/RegistrationPage';

export interface RouteConfig {
    path: string;
    component: ComponentType;
    layout: ComponentType<{ children: ReactNode }>;
}

const publicRoutes: RouteConfig[] = [
    {
        path: '/',
        component: HomePage,
        layout: NothingLayout,
    },
    {
        path: '/home',
        component: HomePage,
        layout: NothingLayout,
    },
    {
        path: '/login',
        component: LoginPage,
        layout: NothingLayout,
    },
    {
        path: '*',
        component: NotFoundPage,
        layout: NothingLayout,
    },
];

const privateRoutes: RouteConfig[] = [
    {
        path: '/student',
        component: StudentPage,
        layout: SidebarLayout,
    },
    {
        path: '/student/notifications',
        component: NotificationsPage,
        layout: SidebarLayout,
    },
    {
        path: '/student/educational-program',
        component: EducationalProgramPage,
        layout: SidebarLayout,
    },
    {
        path: '/student/schedule',
        component: ClassSchedulePage,
        layout: SidebarLayout,
    },
    {
        path: '/student/exam-schedule',
        component: ExamSchedulePage,
        layout: SidebarLayout,
    },
    {
        path: '/student/decisions',
        component: DecisionsPage,
        layout: SidebarLayout,
    },
    {
        path: '/student/attendance',
        component: AttendancePage,
        layout: SidebarLayout,
    },
    {
        path: '/student/conduct-score',
        component: ConductScorePage,
        layout: SidebarLayout,
    },
    {
        path: '/student/academic-results',
        component: AcademicResultsPage,
        layout: SidebarLayout,
    },
    {
        path: '/student/finance',
        component: FinancePage,
        layout: SidebarLayout,
    },
    {
        path: '/student/registration-results',
        component: CourseRegistrationResultsPage,
        layout: SidebarLayout,
    },
    {
        path: '/student/equivalent-courses',
        component: CourseEquivalencyPage,
        layout: SidebarLayout,
    },
    {
        path: '/student/graduation',
        component: GraduationPage,
        layout: SidebarLayout,
    },
    {
        path: '/student/discussion',
        component: DiscussionPage,
        layout: SidebarLayout,
    },
    {
        path: '/student/conduct-assessment',
        component: ConductAssessmentPage,
        layout: SidebarLayout,
    },
    {
        path: '/student/community-service',
        component: CommunityServicePage,
        layout: SidebarLayout,
    },
    {
        path: '/student/certificates',
        component: CertificatesPage,
        layout: SidebarLayout,
    },
    {
        path: '/student/registration',
        component: RegistrationPage,
        layout: SidebarLayout,
    },
    {
        path: '/student/scholarship',
        component: ScholarshipPage,
        layout: SidebarLayout,
    },
];

export const renderRoutes = () => (
    <>
        {publicRoutes.map((route, index) => {
            const Page = route.component;
            const Layout = route.layout;

            return (
                <Route
                    key={index}
                    path={route.path}
                    element={
                        <Layout>
                            <Page />
                        </Layout>
                    }
                />
            );
        })}
        {privateRoutes.map((route, index) => {
            const Page = route.component;
            const Layout = route.layout;

            return (
                <Route
                    key={`private-${index}`}
                    path={route.path}
                    element={
                        <Layout>
                            <Page />
                        </Layout>
                    }
                />
            );
        })}
    </>
);

export { publicRoutes, privateRoutes };
