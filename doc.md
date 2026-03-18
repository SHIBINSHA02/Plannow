# Auto-Assignment Scheduling Algorithm

The `AutoAssign` feature uses a **Greedy Assignment Algorithm** to automatically populate classroom schedules. Below is a detailed explanation of how it works.

## 1. Overview
The goal of the algorithm is to fill empty slots in a classroom's weekly schedule with required subjects while ensuring that teachers are not double-booked across different classrooms.

## 2. Key components
- **Classrooms**: Define which subjects are taught and how many weekly hours of each are required.
- **Teachers**: Define which subjects they are qualified to teach and which organisation they belong to.
- **Schedule Slots**: Represent a specific subject/teacher assignment for a classroom at a specific Day and Period.
- **Workload**: Tracks how many slots a teacher is assigned to, used for reporting and availability checks.

## 3. The Algorithm Steps

### Step 1: Context Gathering
The algorithm fetches all classrooms and teachers within the organisation. It also builds a "Busy Map" of existing assignments to know which teachers and classroom slots are already taken.

### Step 2: Classroom-by-Classroom Processing
The algorithm iterates through every classroom in the organisation one by one.

### Step 3: Subject Requirements
For each classroom, it looks at the list of subjects and identifies those that still have "Weekly Hours Left" to be assigned.

### Step 4: Iterative Slot Filling
For each subject requiring hours, the algorithm scans the weekly grid (Day 1-5, Period 1-6):
1. **Occupancy Check**: If the classroom already has an assignment in this slot (Day X, Period Y), it moves to the next slot.
2. **Teacher Selection**:
   - **Preference 1**: It checks if the subject's **Default Teacher** is available (not busy in another classroom at this specific time).
   - **Preference 2**: If the default teacher is busy or not defined, it searches for **any other teacher** who teaches this subject and is available at this time.
3. **Assignment**: If a teacher is found, a new `ScheduleSlot` is recorded.
4. **State Update**:
   - The subject's **Remaining Hours** is decremented by 1.
   - The teacher's **Workload** is incremented.
   - The teacher is marked as **Busy** for this specific Day/Period to prevent double-booking in subsequent iterations.

### Step 5: Atomic Commitment
All changes are performed within a **Database Transaction**. This ensures that if any error occurs (e.g., a database connection drop), no partial or broken schedule data is saved.

## 4. Limitations
- **Greedy Nature**: The algorithm makes the "best" choice for the first classroom it processes. It does not "re-think" earlier choices if a later classroom becomes impossible to schedule.
- **No Optimization**: It chooses the first available slot/teacher rather than searching for the "most optimal" pedagogical distribution.
