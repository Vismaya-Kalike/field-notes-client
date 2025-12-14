import ContentPage from './ContentPage'

// About section
import { aboutContent } from '@/content/about'
import { purposeContent } from '@/content/about/purpose'
import { agencyContent } from '@/content/about/agency'
import {
  principlesContent,
  joyfulContent,
  selfDeterminedContent,
  openContent,
  communityLeadContent
} from '@/content/about/principles'
import { vikaAndSchoolContent } from '@/content/about/vika-and-school'

// Getting Started section
import {
  gettingStartedContent,
  identifyingSpaceContent,
  identifyingFacilitatorContent,
  identifyingPartnersContent,
  materialListContent,
  playContent,
  indicatorsContent,
  safetyContent,
  faqContent
} from '@/content/getting-started'

// Progress section
import {
  progressContent,
  approachContent,
  fieldNotesContent,
  childrenFeedbackContent,
  portfoliosContent,
  coordinatorReportsContent,
  communityReportingContent,
  homeVisitsContent,
  parentsMeetingsContent,
  metricMelasContent
} from '@/content/progress'

// Resources section
import {
  resourcesContent,
  learningMaterialContent,
  activitiesContent,
  bookOfWonderContent,
  randomizeContent,
  workshopsContent,
  workshopActivitiesContent,
  resourcePeopleContent,
  readingContent,
  booksContent,
  articlesContent,
  papersContent,
  eventsContent,
  programmesContent,
  fieldTripsContent,
  peopleContent,
  organisationsContent,
  documentationContent,
  brandGuidelinesContent
} from '@/content/resources'

// Other pages
import {
  partnersContent,
  partnerOrganisationsContent,
  applyPartnerContent,
  collaborationFrameworkContent,
  scholarshipContent,
  applyScholarshipContent,
  donateContent,
  contactContent,
  governanceContent,
  toolsContent,
  privacyPolicyContent,
  termsContent
} from '@/content/other'

// About pages
export const AboutPage = () => <ContentPage content={aboutContent} />
export const PurposePage = () => <ContentPage content={purposeContent} />
export const AgencyPage = () => <ContentPage content={agencyContent} />
export const PrinciplesPage = () => <ContentPage content={principlesContent} />
export const JoyfulPage = () => <ContentPage content={joyfulContent} />
export const SelfDeterminedPage = () => <ContentPage content={selfDeterminedContent} />
export const OpenPage = () => <ContentPage content={openContent} />
export const CommunityLeadPage = () => <ContentPage content={communityLeadContent} />
export const VikaAndSchoolPage = () => <ContentPage content={vikaAndSchoolContent} />

// Getting Started pages
export const GettingStartedPage = () => <ContentPage content={gettingStartedContent} />
export const IdentifyingSpacePage = () => <ContentPage content={identifyingSpaceContent} />
export const IdentifyingFacilitatorPage = () => <ContentPage content={identifyingFacilitatorContent} />
export const IdentifyingPartnersPage = () => <ContentPage content={identifyingPartnersContent} />
export const MaterialListPage = () => <ContentPage content={materialListContent} />
export const PlayPage = () => <ContentPage content={playContent} />
export const IndicatorsPage = () => <ContentPage content={indicatorsContent} />
export const SafetyPage = () => <ContentPage content={safetyContent} />
export const FAQPage = () => <ContentPage content={faqContent} />

// Progress pages
export const ProgressPage = () => <ContentPage content={progressContent} />
export const ApproachPage = () => <ContentPage content={approachContent} />
export const FieldNotesPage = () => <ContentPage content={fieldNotesContent} />
export const ChildrenFeedbackPage = () => <ContentPage content={childrenFeedbackContent} />
export const PortfoliosPage = () => <ContentPage content={portfoliosContent} />
export const CoordinatorReportsPage = () => <ContentPage content={coordinatorReportsContent} />
export const CommunityReportingPage = () => <ContentPage content={communityReportingContent} />
export const HomeVisitsPage = () => <ContentPage content={homeVisitsContent} />
export const ParentsMeetingsPage = () => <ContentPage content={parentsMeetingsContent} />
export const MetricMelasPage = () => <ContentPage content={metricMelasContent} />

// Resources pages
export const ResourcesPage = () => <ContentPage content={resourcesContent} />
export const LearningMaterialPage = () => <ContentPage content={learningMaterialContent} />
export const ActivitiesPage = () => <ContentPage content={activitiesContent} />
export const BookOfWonderPage = () => <ContentPage content={bookOfWonderContent} />
export const RandomizePage = () => <ContentPage content={randomizeContent} />
export const WorkshopsPage = () => <ContentPage content={workshopsContent} />
export const WorkshopActivitiesPage = () => <ContentPage content={workshopActivitiesContent} />
export const ResourcePeoplePage = () => <ContentPage content={resourcePeopleContent} />
export const ReadingPage = () => <ContentPage content={readingContent} />
export const BooksPage = () => <ContentPage content={booksContent} />
export const ArticlesPage = () => <ContentPage content={articlesContent} />
export const PapersPage = () => <ContentPage content={papersContent} />
export const EventsPage = () => <ContentPage content={eventsContent} />
export const ProgrammesPage = () => <ContentPage content={programmesContent} />
export const FieldTripsPage = () => <ContentPage content={fieldTripsContent} />
export const PeoplePage = () => <ContentPage content={peopleContent} />
export const OrganisationsPage = () => <ContentPage content={organisationsContent} />
export const DocumentationPage = () => <ContentPage content={documentationContent} />
export const BrandGuidelinesPage = () => <ContentPage content={brandGuidelinesContent} />

// Other pages
export const PartnersPage = () => <ContentPage content={partnersContent} />
export const PartnerOrganisationsPage = () => <ContentPage content={partnerOrganisationsContent} />
export const ApplyPartnerPage = () => <ContentPage content={applyPartnerContent} />
export const CollaborationFrameworkPage = () => <ContentPage content={collaborationFrameworkContent} />
export const ScholarshipPage = () => <ContentPage content={scholarshipContent} />
export const ApplyScholarshipPage = () => <ContentPage content={applyScholarshipContent} />
export const DonatePage = () => <ContentPage content={donateContent} />
export const ContactPage = () => <ContentPage content={contactContent} />
export const GovernancePage = () => <ContentPage content={governanceContent} />
export const ToolsPage = () => <ContentPage content={toolsContent} />
export const PrivacyPolicyPage = () => <ContentPage content={privacyPolicyContent} />
export const TermsPage = () => <ContentPage content={termsContent} />
