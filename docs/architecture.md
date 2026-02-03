# Menschis Architecture
The Helper Shifts are structured into several key components that work together to provide a seamless experience for both helpers and those seeking assistance. Below is an overview of the main components of the Helper Shifts architecture:


## Basic Concepts
External Users are Public Users. They do not have an Option to Register an Account but only to Register for Shifts. To Edit a Shift they are tied to a Token that is send via Email after Verification of their Email Address.
Internal Users are Helpers that have an Account in the Nextcloud Instance. They can Login via Nextcloud Auth and Book Shifts. There are Exclusive Internal Shifts aswell as the Option to Register before all others can.

## Data Structure
- Event
  - **Title**: String
  - Description: String
  - StartBookingTimeExternal: DateTime // External People get Access after Internal Helpers had the Chance to register. 
  - StartBookingTimeInternal: DateTime
  - StartDate: DateTime
  - EndDate: DateTime
  - Location: String
  - Shifts: Relation to Shift
- Shift
  - Kind: Relation to ShiftKind
  - StartDate: DateTime
  - EndDate: DateTime
  - Location: GeoPoint
  - Entry: Relation to ShiftEntry
  - **ID**: String
- ShiftKind
  - **Title**: String
  - Description: String
  - Icon: NextIcon
  - Color: String
  - DefaultLocation: GeoPoint
  - Internal: Boolean
- ShiftEntry
  - **Shift**: Relation to Shift
  - **Helper**: Relation to User
  - Notes: String
  - CreatedAt: DateTime
  - UpdatedAt: DateTime
- AnonymousUser
  - Name: String
  - **Email**: String
  - Phone: String
  - EmailAuthTokens: []String
  - Entries: Relation to ShiftEntry
- User (Not in DB will be extracted from Auth Token by Nextcloud)


### User Roles
- `Admin`: Full access to all features and settings.
- `Internal`: Can view and book internal shifts.
- `Planner`: Can create and manage events and shifts. Can Also See all Shifts before StartBookingTime. Have Access to Impersination Mode of Internal/Public Users.
