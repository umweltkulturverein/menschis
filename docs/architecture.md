# Menschis Architecture
The Helper Shifts are structured into several key components that work together to provide a seamless experience for both helpers and those seeking assistance. Below is an overview of the main components of the Helper Shifts architecture:


## Basic Concepts
External Users are Public Users. They do not have an Option to Register an Account but only to Register for Shifts. To Edit a Shift they are tied to a Token that is send via Email after Verification of their Email Address.
Internal Users are Helpers that have an Account in the Nextcloud Instance. They can Login via Nextcloud Auth and Book Shifts. There are Exclusive Internal Shifts aswell as the Option to Register before all others can.

Magic Link Shift Registration Validation:
- Cloudflare Captcha to Register
- After applying for a shift show no confirmation and rather a yellow warning saying confirm your email first to keep the shift entry
- Shift entrys will expire after 2h if the email is not verified
-> Reason: Without Registration Shift Planning Teams need a verified communication endpoint for sending important informations out

## Data Structure
- Event
  - **Title**: String
  - Description: String
  - StartBookingDateTime: DateTime // Booking opens; planners/internal users can see shifts before this.
  - StartDate: DateTime
  - EndDate: DateTime
  - Location: String
  - Shifts: Relation to Shift
- Shift
  - Kind: Relation to ShiftKind
  - StartDateTime: DateTime
  - EndDateTime: DateTime
  - Location: GeoPoint
  - Entry: Relation to ShiftEntry
  - Internal: Boolean
  - **ID**: String
- ShiftKind
  - **ID**: String
  - Title: String
  - UnauthorizedMessage: String // Can be different. Awareness may Contain "Contact Awareness Team", Internal Shifts may Contain "Team-Only or Login with SSO Account"
  - AuthorizationMagicLinkToken // The Shift-Planner can Create a Link and send it to anyone who wants to register for a shift after getting some introduction
  - Description: String
  - Icon: NextIcon
  - Color: String
  - AllAccess: Boolean // Issues a ticket for every EventDay instead of only the shift's day
  - DefaultLocation: GeoPoint
- ShiftEntry
  - **Shift**: Relation to Shift
  - **Person**: Relation to Person
  - Notes: String
  - CreatedAt: DateTime
  - UpdatedAt: DateTime
- Person
  - ID: Serial
  - Sub: (Imported from SUB when SSO; `email:<address>` for guests)
  - Name: String
  - Email: String
  - Phone: String
  - LoginToken: String // magic-link token; see magiclinks.md
  - Roles: []String
  - Entries: Relation to ShiftEntry


### User Roles
- `Admin`: Full access to all features and settings.
- `Internal`: Can view and book internal shifts.
- `Planner`: Can create and manage events and shifts. Can Also See all Shifts before StartBookingTime. Have Access to Impersination Mode of Internal/Public Users.
