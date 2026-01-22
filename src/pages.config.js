import AdminModeration from './pages/AdminModeration';
import Community from './pages/Community';
import Deadlines from './pages/Deadlines';
import GuideDetail from './pages/GuideDetail';
import Guides from './pages/Guides';
import IMGPrograms from './pages/IMGPrograms';
import Legal from './pages/Legal';
import Mentors from './pages/Mentors';
import Notifications from './pages/Notifications';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import ResearchOpportunities from './pages/ResearchOpportunities';
import USMLEQuizPack from './pages/USMLEQuizPack';
import Dashboard from './pages/Dashboard';
import InterviewCourse from './pages/InterviewCourse';
import Onboarding from './pages/Onboarding';
import Subscription from './pages/Subscription';
import SurgeryGuide from './pages/SurgeryGuide';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminModeration": AdminModeration,
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
    "ResearchOpportunities": ResearchOpportunities,
    "USMLEQuizPack": USMLEQuizPack,
    "Dashboard": Dashboard,
    "InterviewCourse": InterviewCourse,
    "Onboarding": Onboarding,
    "Subscription": Subscription,
    "SurgeryGuide": SurgeryGuide,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};