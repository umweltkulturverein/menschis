# Menschis Architecture
The Helper Shifts are structured into several key components that work together to provide a seamless experience for both helpers and those seeking assistance. Below is an overview of the main components of the Helper Shifts architecture:


## Data Structure
- Shift
  - Kind: Relation to ShiftKind
  - StartDate: DateTime
  - EndDate: DateTime
  - Location: GeoPoint
  - Entry: Relation to ShiftEntry
  - *ID*: String
- ShiftKind
  - *Title*: String
  - Description: String
  - Icon: NextIcon
  - Color: String
  - DefaultLocation: GeoPoint
- ShiftEntry
  - *Shift*: Relation to Shift
  - *Helper*: Relation to User
  - Notes: String
  - CreatedAt: DateTime
  - UpdatedAt: DateTime
- AnonymousUser
  - Name: String
  - *Email*: String
  - Phone: String
  - EmailAuthTokens: []String
  - Entries: Relation to ShiftEntry
- User (Not in DB will be extracted from Auth Token by Nextcloud)
