import { Routes, Route } from 'react-router-dom'
import DistrictsList from './components/DistrictsList'
import LearningCentresList from './components/LearningCentresList'
import LearningCentreDetail from './components/LearningCentreDetail'
import CoordinatorFieldNoteDetail from './components/CoordinatorFieldNoteDetail'
import ChildFieldNotes from './components/ChildFieldNotes'
import ReportDetail from './components/ReportDetail'
import LLMAnalysisPlayground from './components/LLMAnalysisPlayground'
import { Sidebar } from './components/Sidebar'

// Page imports
import {
  // About
  AboutPage,
  PurposePage,
  AgencyPage,
  PrinciplesPage,
  JoyfulPage,
  SelfDeterminedPage,
  OpenPage,
  CommunityLeadPage,
  VikaAndSchoolPage,
  // Getting Started
  GettingStartedPage,
  IdentifyingSpacePage,
  IdentifyingFacilitatorPage,
  IdentifyingPartnersPage,
  MaterialListPage,
  PlayPage,
  IndicatorsPage,
  SafetyPage,
  FAQPage,
  // Progress
  ProgressPage,
  ApproachPage,
  FieldNotesPage,
  ChildrenFeedbackPage,
  PortfoliosPage,
  CoordinatorReportsPage,
  CommunityReportingPage,
  HomeVisitsPage,
  ParentsMeetingsPage,
  MetricMelasPage,
  // Resources
  ResourcesPage,
  LearningMaterialPage,
  ActivitiesPage,
  BookOfWonderPage,
  RandomizePage,
  WorkshopsPage,
  WorkshopActivitiesPage,
  ResourcePeoplePage,
  ReadingPage,
  BooksPage,
  ArticlesPage,
  PapersPage,
  EventsPage,
  ProgrammesPage,
  FieldTripsPage,
  PeoplePage,
  OrganisationsPage,
  DocumentationPage,
  BrandGuidelinesPage,
  // Other
  PartnersPage,
  PartnerOrganisationsPage,
  ApplyPartnerPage,
  CollaborationFrameworkPage,
  ScholarshipPage,
  ApplyScholarshipPage,
  DonatePage,
  ContactPage,
  BlogPage,
  GovernancePage,
  ToolsPage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages'

function App() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Routes>
          {/* Learning Centers (existing) */}
          <Route path="/" element={<DistrictsList />} />
          <Route path="/playground" element={<LLMAnalysisPlayground />} />
          <Route path="/:state/:district" element={<LearningCentresList />} />
          <Route path="/:state/:district/centre/:centreId" element={<LearningCentreDetail />} />
          <Route path="/:state/:district/centre/:centreId/coordinator-notes/:noteId" element={<CoordinatorFieldNoteDetail />} />
          <Route path="/:state/:district/centre/:centreId/child/:childId" element={<ChildFieldNotes />} />
          <Route path="/:state/:district/centre/:centreId/report/:reportId" element={<ReportDetail />} />

          {/* About */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/purpose" element={<PurposePage />} />
          <Route path="/about/agency" element={<AgencyPage />} />
          <Route path="/about/principles" element={<PrinciplesPage />} />
          <Route path="/about/principles/joyful" element={<JoyfulPage />} />
          <Route path="/about/principles/self-determined" element={<SelfDeterminedPage />} />
          <Route path="/about/principles/open" element={<OpenPage />} />
          <Route path="/about/principles/community-lead" element={<CommunityLeadPage />} />
          <Route path="/about/vika-and-school" element={<VikaAndSchoolPage />} />

          {/* Getting Started */}
          <Route path="/getting-started" element={<GettingStartedPage />} />
          <Route path="/getting-started/identifying-space" element={<IdentifyingSpacePage />} />
          <Route path="/getting-started/identifying-facilitator" element={<IdentifyingFacilitatorPage />} />
          <Route path="/getting-started/identifying-partners" element={<IdentifyingPartnersPage />} />
          <Route path="/getting-started/material-list" element={<MaterialListPage />} />
          <Route path="/getting-started/play" element={<PlayPage />} />
          <Route path="/getting-started/indicators" element={<IndicatorsPage />} />
          <Route path="/getting-started/safety" element={<SafetyPage />} />
          <Route path="/getting-started/faq" element={<FAQPage />} />

          {/* Understanding Progress */}
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/progress/approach" element={<ApproachPage />} />
          <Route path="/progress/field-notes" element={<FieldNotesPage />} />
          <Route path="/progress/children-feedback" element={<ChildrenFeedbackPage />} />
          <Route path="/progress/portfolios" element={<PortfoliosPage />} />
          <Route path="/progress/coordinator-reports" element={<CoordinatorReportsPage />} />
          <Route path="/progress/community" element={<CommunityReportingPage />} />
          <Route path="/progress/community/home-visits" element={<HomeVisitsPage />} />
          <Route path="/progress/community/parents-meetings" element={<ParentsMeetingsPage />} />
          <Route path="/progress/community/metric-melas" element={<MetricMelasPage />} />

          {/* Resources */}
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/learning-material" element={<LearningMaterialPage />} />
          <Route path="/resources/activities" element={<ActivitiesPage />} />
          <Route path="/resources/activities/book-of-wonder" element={<BookOfWonderPage />} />
          <Route path="/resources/activities/randomize" element={<RandomizePage />} />
          <Route path="/resources/workshops" element={<WorkshopsPage />} />
          <Route path="/resources/workshops/activities" element={<WorkshopActivitiesPage />} />
          <Route path="/resources/workshops/resource-people" element={<ResourcePeoplePage />} />
          <Route path="/resources/reading" element={<ReadingPage />} />
          <Route path="/resources/reading/books" element={<BooksPage />} />
          <Route path="/resources/reading/articles" element={<ArticlesPage />} />
          <Route path="/resources/reading/papers" element={<PapersPage />} />
          <Route path="/resources/events" element={<EventsPage />} />
          <Route path="/resources/events/programmes" element={<ProgrammesPage />} />
          <Route path="/resources/events/field-trips" element={<FieldTripsPage />} />
          <Route path="/resources/people" element={<PeoplePage />} />
          <Route path="/resources/organisations" element={<OrganisationsPage />} />
          <Route path="/resources/docs" element={<DocumentationPage />} />
          <Route path="/resources/brand-guidelines" element={<BrandGuidelinesPage />} />

          {/* Partners */}
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/partners/organisations" element={<PartnerOrganisationsPage />} />
          <Route path="/partners/apply" element={<ApplyPartnerPage />} />
          <Route path="/partners/collaboration-framework" element={<CollaborationFrameworkPage />} />

          {/* Scholarship */}
          <Route path="/scholarship" element={<ScholarshipPage />} />
          <Route path="/scholarship/apply" element={<ApplyScholarshipPage />} />

          {/* Other */}
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/governance" element={<GovernancePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
