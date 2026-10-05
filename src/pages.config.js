import { lazy } from 'react';

/*
 * Route-level code splitting.
 * Each page is a dynamic import, so Vite emits one chunk per route instead of a
 * single monolithic bundle. Values in PAGES are React lazy elements (they
 * unwrap their own `.default`), so consumers must render them inside a
 * <Suspense> boundary — App.jsx does exactly that.
 * Keys are the route contract (NavigationTracker, search, tests), so they are
 * unchanged, including the interview-course aliases.
 */
const AdminModeration = lazy(() => import('./pages/AdminModeration'));
const Login = lazy(() => import('./pages/Login'));
const Community = lazy(() => import('./pages/Community'));
const Deadlines = lazy(() => import('./pages/Deadlines'));
const GuideDetail = lazy(() => import('./pages/GuideDetail'));
const Guides = lazy(() => import('./pages/Guides'));
const IMGPrograms = lazy(() => import('./pages/IMGPrograms'));
const Legal = lazy(() => import('./pages/Legal'));
const Mentors = lazy(() => import('./pages/Mentors'));
const Notifications = lazy(() => import('./pages/Notifications'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const ProgramDetail = lazy(() => import('./pages/ProgramDetail'));
const ProgramsList = lazy(() => import('./pages/ProgramsList'));
const ResearchOpportunities = lazy(() => import('./pages/ResearchOpportunities'));
const USMLEQuizPack = lazy(() => import('./pages/USMLEQuizPack'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InterviewCourse = lazy(() => import('./pages/InterviewCourse'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Subscription = lazy(() => import('./pages/Subscription'));
const SurgeryGuide = lazy(() => import('./pages/SurgeryGuide'));
const AnkiGuide = lazy(() => import('./pages/AnkiGuide'));
const MatchCostCalculator = lazy(() => import('./pages/MatchCostCalculator'));
const BookCatalog = lazy(() => import('./pages/BookCatalog'));
import __Layout from './Layout.jsx';


export const PAGES = {
    "Login": Login,
    "AdminModeration": AdminModeration,
    "AnkiGuide": AnkiGuide,
    "BookCatalog": BookCatalog,
    "Community": Community,
    "Deadlines": Deadlines,
    "GuideDetail": GuideDetail,
    "Guides": Guides,
    "IMGPrograms": IMGPrograms,
    "Legal": Legal,
    "Mentors": Mentors,
    "Notifications": Notifications,
    "PostDetail": PostDetail,
    "Profile": Profile,
    "ProgramDetail": ProgramDetail,
    "ProgramsList": ProgramsList,
    "ResearchOpportunities": ResearchOpportunities,
    "USMLEQuizPack": USMLEQuizPack,
    "Dashboard": Dashboard,
    "InterviewCourse": InterviewCourse,
    "interviewcourse": InterviewCourse,
    "interview-course": InterviewCourse,
    "Onboarding": Onboarding,
    "Subscription": Subscription,
    "SurgeryGuide": SurgeryGuide,
    "MatchCostCalculator": MatchCostCalculator,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};