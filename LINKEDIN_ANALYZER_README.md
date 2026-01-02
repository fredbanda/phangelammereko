# LinkedIn Profile Analyzer Component

A comprehensive LinkedIn profile analysis tool that uses AI to provide personalized optimization recommendations.

## Features

### 🤖 AI-Powered Analysis
- Uses Gemini AI to analyze LinkedIn profiles
- Provides detailed scoring for headline, summary, experience, and skills
- Generates personalized recommendations for improvement
- Includes AI skills recommendations for future career growth

### 📊 Comprehensive Scoring
- **Overall Score**: 0-100% profile optimization score
- **Section Scores**: Individual scores for each profile section
- **Keyword Analysis**: Missing keywords and optimization suggestions
- **Industry Benchmarks**: Compare against industry standards

### 📄 Professional Reports
- Generate PDF reports with all recommendations
- Download and share analysis results
- Professional formatting with actionable insights
- Implementation timeline (quick wins vs long-term goals)

### 💼 Professional Services Integration
- Book LinkedIn optimization services directly from the app
- Multiple service packages (Standard, Priority, Urgent)
- Integrated payment processing
- Account creation for report history

## Components

### Main Components

1. **LinkedinAnalyzer** - Main component that orchestrates the entire flow
2. **LinkedinAnalysisResults** - Displays AI analysis results and scores
3. **LinkedinReportGenerator** - Handles PDF report generation and download
4. **AccountCreationPrompt** - Prompts users to create accounts to save reports
5. **OptimizationBookingModal** - Booking interface for professional services

### Input Components

1. **LinkedinManualInput** - Manual profile data entry form
2. **LinkedinPdfUpload** - PDF upload functionality

## Usage

### Basic Usage

```tsx
import { LinkedinAnalyzer } from "@/components/linkedin/linkedin-analyzer"

export default function AnalyzerPage() {
  return <LinkedinAnalyzer />
}
```

### Standalone Components

```tsx
// Use individual components
import { LinkedinManualInput } from "@/components/linkedin/linkedin-manual-input"
import { LinkedinAnalysisResults } from "@/components/linkedin/linkedin-analysis-results"

function CustomAnalyzer() {
  const handleProfileSubmit = (data) => {
    // Handle profile submission
  }

  return (
    <div>
      <LinkedinManualInput onProfileSubmit={handleProfileSubmit} />
      {analysisData && <LinkedinAnalysisResults data={analysisData} />}
    </div>
  )
}
```

## API Endpoints

### Analysis Endpoint
- **POST** `/api/linkedin/analyze`
- Analyzes LinkedIn profile data using AI
- Returns comprehensive analysis with scores and recommendations

### Report Generation
- **POST** `/api/linkedin/generate-report`
- Generates PDF reports from analysis data
- Returns download URL for the report

### Account Creation
- **POST** `/api/users/create-account`
- Creates user accounts to save analysis reports
- Links reports to user profiles

### PDF Download
- **GET** `/api/linkedin/download-report/pdf?profileId={id}`
- Downloads generated PDF reports
- Returns HTML report (can be extended to actual PDF)

## Database Schema

The component integrates with existing Prisma schema:

- **LinkedinProfile** - Stores profile data and analysis results
- **OptimizationReport** - Stores detailed analysis and recommendations
- **User** - User accounts for saving reports
- **Lead** - Marketing leads from profile analysis
- **ConsultationOrder** - Professional service bookings

## AI Integration

Uses Gemini AI for profile analysis:

```typescript
// Example AI prompt structure
const analysisPrompt = `
Analyze this LinkedIn profile and provide detailed optimization recommendations:

PROFILE DATA:
- Headline: ${profileData.headline}
- Summary: ${profileData.summary}
- Skills: ${profileData.skills.join(", ")}
- Experience: ${JSON.stringify(profileData.experiences)}

Provide analysis in JSON format with scores and recommendations...
`
```

## Configuration

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URI=your_database_connection_string
```

### Dependencies

- `@google/generative-ai` - Gemini AI integration
- `@prisma/client` - Database operations
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `sonner` - Toast notifications

## Styling

Uses Tailwind CSS with shadcn/ui components:
- Responsive design
- Dark mode support
- Professional color scheme
- Accessible components

## Features in Detail

### Profile Input Methods
1. **PDF Upload**: Users can upload LinkedIn PDF exports
2. **Manual Entry**: Comprehensive form for manual data entry
3. **Validation**: Real-time form validation and completion tracking

### AI Analysis Features
- **Keyword Optimization**: Identifies missing industry keywords
- **Content Analysis**: Evaluates professional language and impact
- **Skills Assessment**: Recommends trending and AI skills
- **Structure Analysis**: Checks profile completeness
- **Industry Benchmarking**: Compares against industry standards

### Report Features
- **Executive Summary**: High-level analysis overview
- **Detailed Scoring**: Section-by-section breakdown
- **Actionable Recommendations**: Specific improvement suggestions
- **Implementation Timeline**: Prioritized action items
- **AI Skills Roadmap**: Future-ready skills to learn

### Service Integration
- **Package Selection**: Multiple service tiers
- **Booking Flow**: Integrated consultation booking
- **Payment Processing**: Stripe integration for payments
- **Order Management**: Track service delivery

## Customization

### Styling
Modify the Tailwind classes in components to match your brand:

```tsx
// Example: Custom color scheme
<Card className="bg-gradient-to-r from-your-brand-50 to-your-brand-100">
```

### AI Prompts
Customize the analysis prompts in `/api/linkedin/analyze/route.ts`:

```typescript
const customPrompt = `
Your custom analysis instructions...
Focus on: ${customCriteria}
Industry: ${specificIndustry}
`
```

### Service Packages
Modify packages in `OptimizationBookingModal`:

```typescript
const customPackages = [
  {
    id: "BASIC",
    name: "Basic Package",
    price: 1500,
    features: ["Custom features..."]
  }
]
```

## Pages

- `/linkedin-analyzer` - Main analyzer page
- `/linkedin-analyzer-demo` - Demo/landing page

## Future Enhancements

1. **Real PDF Generation**: Implement actual PDF generation with puppeteer
2. **Cloud Storage**: Store reports in AWS S3 or similar
3. **Email Integration**: Send reports via email
4. **Progress Tracking**: Track profile improvements over time
5. **Team Features**: Multi-user accounts for organizations
6. **Advanced Analytics**: Detailed usage and performance metrics

## Support

For questions or issues with the LinkedIn analyzer component, please refer to the main application documentation or contact the development team.