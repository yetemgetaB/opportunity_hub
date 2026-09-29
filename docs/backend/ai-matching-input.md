# AI Matching Input Requirements

## Purpose

This document defines the student profile information required for future AI matching.

The AI matching system will later compare a student's profile with available opportunities and produce a match score.

The matching algorithm is not implemented as part of Day 5. Day 5 focuses on making sure the required student profile information is available for future matching.

## Required Student Profile Information

The future AI matching system should use the following student profile information:

### 1. Field of Study

**Field:** `fieldOfStudy`

**Example:**

```json
"fieldOfStudy": "Computer Science"
```

This identifies the student's academic field and can be used when comparing the student's profile with an opportunity.

### 2. Academic Year

**Field:** `academicYear`

**Example:**

```json
"academicYear": 3
```

This identifies the student's current academic year and can be used as part of future matching.

### 3. Skills

**Field:** `skills`

**Example:**

```json
"skills": ["Python", "SQL"]
```

This contains the skills of the student and can be compared with skills required by an opportunity.

### 4. Interests

**Field:** `interests`

**Example:**

```json
"interests": ["AI", "Backend Development"]
```

This contains the student's areas of interest and can be used as part of future opportunity matching.

### 5. Career Goals

**Field:** `careerGoals`

**Example:**

```json
"careerGoals": ["AI Engineer"]
```

This describes the student's career goals and can be considered during future matching.

### 6. Location

**Field:** `location`

**Example:**

```json
"location": "Addis Ababa"
```

This identifies the student's location and can be used as an input for future matching.

## Example Student Profile

```json
{
  "fieldOfStudy": "Computer Science",
  "academicYear": 3,
  "skills": ["Python", "SQL"],
  "interests": ["AI", "Backend Development"],
  "careerGoals": ["AI Engineer"],
  "location": "Addis Ababa"
}
```

## Future Matching Flow

The future matching system will use student profile information when comparing students with opportunities.

```text
Student Profile
      ↓
Profile Information
      ↓
Matching Engine
      ↓
Match Score
```

The matching engine itself is not implemented as part of Day 5.

## Authentication and Profile Access

The student profile must be associated with the authenticated user.

The expected flow is:

```text
Student Login
      ↓
JWT
      ↓
GET /students/profile
      ↓
Authenticated student's profile
```

The profile endpoint should return the profile belonging to the authenticated student.

Unauthenticated access should be rejected.

```text
No JWT
   ↓
GET /students/profile
   ↓
401 Unauthorized
```

Students should also not be able to access another student's private profile through an insecure endpoint.

## Day 5 Integration Requirements

After the Student Profile API and database are available, Backend 3 should verify that:

1. The Student Profile API provides the required matching fields.
2. The profile data is stored and retrieved correctly from the database.
3. The profile is associated with the authenticated user.
4. The student can access their own profile.
5. Unauthenticated requests are rejected.
6. Students cannot access another student's private profile.

These requirements will allow the student profile to be used as an input for future AI matching.
