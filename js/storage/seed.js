/* ============================================================
   GymPro - Seed Data
   Generates realistic gym demo data on first launch:
   500 members, 40 trainers, 10 plans, 3 branches, 1000 attendance,
   500 payments, 50 classes, 200 inventory, 150 equipment, 20 users.
   ============================================================ */
const GymProSeed = (() => {
  const firstNameM = ['James','John','Robert','Michael','William','David','Richard','Joseph','Thomas','Charles','Chris','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Joshua','Kenneth','Kevin','Brian','George','Timothy','Ronald','Edward','Jason','Jeffrey','Ryan','Jacob','Gary','Nicholas','Eric','Jonathan','Stephen','Larry','Justin','Scott','Brandon','Samuel','Omar','Ali','Hassan','Youssef','Karim','Tarek','Omar','Khaled','Amr','Mostafa'];
  const firstNameF = ['Mary','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen','Lisa','Nancy','Betty','Margaret','Sandra','Ashley','Kimberly','Emily','Donna','Michelle','Carol','Amanda','Dorothy','Melissa','Deborah','Stephanie','Rebecca','Sharon','Laura','Cynthia','Kathleen','Amy','Angela','Shirley','Anna','Brenda','Pamela','Emma','Dana','Nadia','Laila','Mona','Sara','Heba','Dina','Nour','Salma','Mariam','Yara','Farah'];
  const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Hassan','Mohamed','Ahmed','Ibrahim','Mahmoud','Youssef','Fathy','Sayed','Mostafa','Ashraf'];

  const branchNames = ['Downtown Main','Riverside Branch','City Heights Branch'];
  const branchCities = ['New York','Los Angeles','Chicago'];
  const branchAddresses = ['245 Madison Ave','890 Sunset Blvd','1200 Michigan Ave'];

  const planNames = [
    { name: 'Basic Monthly', price: 29.99, duration: 1, perks: ['Gym access', 'Locker'] },
    { name: 'Standard Monthly', price: 49.99, duration: 1, perks: ['Gym access', 'Locker', 'Group classes'] },
    { name: 'Premium Monthly', price: 79.99, duration: 1, perks: ['Gym access', 'Locker', 'Group classes', 'Sauna'] },
    { name: 'Basic Quarterly', price: 79.99, duration: 3, perks: ['Gym access', 'Locker'] },
    { name: 'Standard Quarterly', price: 129.99, duration: 3, perks: ['Gym access', 'Locker', 'Group classes'] },
    { name: 'Premium Quarterly', price: 199.99, duration: 3, perks: ['Gym access', 'Locker', 'Group classes', 'Sauna', 'Personal trainer'] },
    { name: 'Basic Annual', price: 249.99, duration: 12, perks: ['Gym access', 'Locker'] },
    { name: 'Standard Annual', price: 399.99, duration: 12, perks: ['Gym access', 'Locker', 'Group classes'] },
    { name: 'Premium Annual', price: 599.99, duration: 12, perks: ['Gym access', 'Locker', 'Group classes', 'Sauna', 'Personal trainer', 'Nutrition plan'] },
    { name: 'Student Monthly', price: 19.99, duration: 1, perks: ['Gym access', 'Student discount'] },
  ];

  const trainingSpecialties = ['Strength Training','Cardio','CrossFit','Yoga','Pilates','Zumba','HIIT','Bodybuilding','Personal Training','Kickboxing','Spin','Functional Training'];
  const classNames = ['Morning Yoga','HIIT Blast','CrossFit WOD','Zumba Dance','Spin Class','Strength Circuit','Pilates Core','Kickboxing','Functional Training','Body Sculpt','Boxing Basics','Power Yoga','Turbo Spin','Full Body Burn','Upper Body Focus','Lower Body Blast','Core & Abs','Stretching & Mobility','Bootcamp','Cardio Kickboxing'];

  const equipmentTypes = ['Treadmill','Elliptical','Stationary Bike','Rowing Machine','Bench Press','Dumbbells Set','Barbell Set','Kettlebell','Leg Press','Cable Machine','Pull-Up Bar','Squat Rack','Lat Pulldown','Leg Curl','Chest Fly','Smith Machine','Stair Climber','Battle Ropes','Medicine Ball','TRX System'];
  const equipmentBrands = ['Life Fitness','Precor','Technogym','Cybex','Matrix','Hammer Strength','Hoist','Bowflex','Nautilus'];

  const inventoryItems = [
    'Protein Powder','Whey Isolate','Creatine Monohydrate','BCAA','Pre-Workout','Multivitamin','Omega-3','Vitamin D3','Recovery Shake','Energy Bar','Protein Bar','Water Bottle','Gym Towel','Gym Bag','Jump Rope','Resistance Band','Yoga Mat','Lifting Straps','Gym Gloves','Shaker Bottle','Knee Sleeves','Weight Belt','Massage Gun','Fitness Tracker','Headphones','Gym Shirt','Gym Shorts','Sweatband','Grip Chalk','Foam Roller'
  ];
  const inventoryCategories = ['Supplements','Accessories','Apparel','Equipment','Nutrition'];

  const workoutNames = ['Full Body Strength','Upper Body Power','Lower Body Sculpt','Push Day','Pull Day','Leg Day','Core Crusher','HIIT Cardio','Hypertrophy Program','Endurance Builder','Fat Loss Blast','Muscle Gain Program','Athletic Performance','Mobility Flow','Beginner Foundations'];
  const nutritionNames = ['Lean Muscle Meal Plan','Fat Loss Diet','Keto Diet Plan','Vegan Meal Plan','High Protein Diet','Balanced Nutrition Plan','Performance Diet','Low Carb Plan','Bulking Diet','Clean Eating Plan'];

  const measurementTypes = ['Weight','Body Fat %','Chest','Waist','Hips','Biceps','Thighs','Shoulders'];

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function pick(arr) {
    return arr[rand(0, arr.length - 1)];
  }
  function dateDaysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  }
  function randomDate(startDaysAgo, endDaysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - rand(startDaysAgo, endDaysAgo));
    return d.toISOString();
  }
  function randomPhone() {
    return '+1 ' + rand(200, 989) + '-' + rand(200, 989) + '-' + rand(1000, 9999);
  }
  function randomEmail(name, i) {
    return name.toLowerCase().replace(/[^a-z]/g, '') + i + '@mail.com';
  }

  function makePerson(i) {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const first = gender === 'male' ? pick(firstNameM) : pick(firstNameF);
    const last = pick(lastNames);
    const full = first + ' ' + last;
    const height = gender === 'male' ? rand(165, 195) : rand(155, 180);
    const weight = gender === 'male' ? rand(65, 110) : rand(50, 85);
    return { full_name: full, first, last, gender, height, weight };
  }

  function generateMembers(count) {
    const members = [];
    for (let i = 0; i < count; i++) {
      const p = makePerson(i);
      const joinDaysAgo = rand(1, 730);
      const status = Math.random();
      const membershipStatus = joinDaysAgo > 700 ? 'expired' : (status < 0.7 ? 'active' : (status < 0.9 ? 'active' : 'pending'));
      const branchId = rand(1, 3);
      const planId = rand(1, 10);
members.push({
        id: i + 1,
        full_name: p.full_name,
        email: randomEmail(p.full_name, i),
        phone: randomPhone(),
        gender: p.gender,
        birth_date: randomDate(7300, 12000),
        address: rand(1, 999) + ' ' + pick(['Main St','Oak Ave','Maple Dr','Park Blvd','Cedar Ln','Lake Rd','Hill St']) + ', ' + pick(branchCities),
        emergency_contact: randomPhone(),
        height: p.height,
        weight: p.weight,
        join_date: randomDate(1, 730).slice(0, 10),
        membership_status: membershipStatus,
        branch_id: branchId,
        plan_id: planId,
        membership_expiry: dateDaysAgo(membershipStatus === 'expired' ? rand(1, 90) : -rand(30, 300)),
        notes: Math.random() > 0.85 ? 'VIP member' : '',
      });
    }
    return members;
  }

  function generateTrainers(count) {
    const trainers = [];
    const specialties = [...trainingSpecialties];
    for (let i = 0; i < count; i++) {
      const p = makePerson(i);
      // pick unique specialties
      const spec = [];
      const pool = [...specialties];
      const n = rand(1, 3);
      for (let s = 0; s < n; s++) {
        if (pool.length === 0) break;
        const idx = rand(0, pool.length - 1);
        spec.push(pool.splice(idx, 1)[0]);
      }
      const status = Math.random() < 0.9 ? 'active' : 'inactive';
      trainers.push({
id: i + 1,
        full_name: p.full_name,
        email: randomEmail(p.full_name, i),
        phone: randomPhone(),
        gender: p.gender,
        specialty: spec.join(', '),
        experience_years: rand(1, 20),
        branch_id: rand(1, 3),
        status,
        hourly_rate: rand(20, 80),
        hire_date: randomDate(365, 2500).slice(0, 10),
        bio: 'Certified professional trainer specializing in ' + spec.join(' and ') + '.',
      });
    }
    return trainers;
  }

  function generatePlans() {
    return planNames.map((p, i) => ({
      id: i + 1,
      name: p.name,
      price: p.price,
      duration_months: p.duration,
      perks: p.perks.join(', '),
      status: 'active',
      description: 'Perfect for ' + (p.duration === 1 ? 'monthly' : p.duration + '-month') + ' commitment.',
    }));
  }

  function generateBranches() {
    return branchNames.map((n, i) => ({
      id: i + 1,
      name: n,
      city: branchCities[i],
      address: branchAddresses[i],
      phone: randomPhone(),
      status: 'active',
      manager_id: rand(1, 40),
      opened_date: randomDate(500, 3000).slice(0, 10),
    }));
  }

  function generateAttendance(count, members) {
    const attendance = [];
    for (let i = 0; i < count; i++) {
      const member = members[rand(0, members.length - 1)];
      const checkedInAt = randomDate(0, 30);
      attendance.push({
        id: i + 1,
        member_id: member.id,
        member_name: member.full_name,
        check_in: checkedInAt,
        check_out: Math.random() > 0.4 ? new Date(new Date(checkedInAt).getTime() + rand(30, 120) * 60000).toISOString() : null,
        branch_id: member.branch_id,
        status: Math.random() < 0.7 ? 'completed' : 'active',
      });
    }
    return attendance;
  }

  function generatePayments(count, members) {
    const payments = [];
    const methods = ['Cash','Credit Card','Debit Card','Bank Transfer','Mobile Payment'];
    const statuses = ['completed','pending','failed'];
    for (let i = 0; i < count; i++) {
      const member = members[rand(0, members.length - 1)];
      const plan = planNames[rand(0, planNames.length - 1)];
      const method = pick(methods);
      const status = method === 'Cash' ? 'completed' : pick(statuses);
      payments.push({
        id: i + 1,
        member_id: member.id,
        member_name: member.full_name,
        plan_name: plan.name,
        amount: plan.price,
        method,
        status,
        date: randomDate(0, 365).slice(0, 10),
        branch_id: member.branch_id,
        reference: 'PAY-' + (100000 + i),
      });
    }
    return payments;
  }

  function generateClasses(count) {
    const classes = [];
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const times = ['06:00','07:00','08:00','09:00','10:00','17:00','18:00','19:00','20:00'];
    for (let i = 0; i < count; i++) {
      const trainerId = rand(1, 40);
      const capacity = rand(10, 30);
      classes.push({
        id: i + 1,
        name: classNames[i % classNames.length] + (i >= classNames.length ? ' ' + Math.floor(i / classNames.length + 1) : ''),
        trainer_id: trainerId,
        day: pick(days),
        time: pick(times),
        capacity,
        enrolled: rand(3, capacity),
        branch_id: rand(1, 3),
        status: Math.random() < 0.9 ? 'active' : 'inactive',
        room: 'Studio ' + rand(1, 4),
      });
    }
    return classes;
  }

  function generateInventory(count) {
    const items = [];
    for (let i = 0; i < count; i++) {
      const qty = rand(0, 200);
      const reorder = rand(5, 20);
      items.push({
        id: i + 1,
        name: inventoryItems[i % inventoryItems.length] + (i >= inventoryItems.length ? ' ' + Math.floor(i / inventoryItems.length + 1) : ''),
        category: pick(inventoryCategories),
        sku: 'SKU-' + (1000 + i),
        price: Number((Math.random() * 80 + 5).toFixed(2)),
        cost: Number((Math.random() * 40 + 2).toFixed(2)),
        quantity: qty,
        reorder_level: reorder,
        branch_id: rand(1, 3),
        supplier: pick(['HealthSupplies Co','FitGear Inc','ProNutrition Ltd','GymEssentials']),
        status: qty === 0 ? 'out_of_stock' : (qty <= reorder ? 'low_stock' : 'in_stock'),
      });
    }
    return items;
  }

  function generateEquipment(count) {
    const equipment = [];
    const conditions = ['new','good','fair','needs_maintenance'];
    for (let i = 0; i < count; i++) {
      const type = equipmentTypes[i % equipmentTypes.length];
      const purchaseDaysAgo = rand(30, 2000);
      equipment.push({
        id: i + 1,
        name: type + (Math.random() > 0.5 ? '' : ' ' + pick(equipmentBrands)),
        type,
        brand: pick(equipmentBrands),
        branch_id: rand(1, 3),
        status: Math.random() < 0.85 ? 'operational' : (Math.random() < 0.5 ? 'maintenance' : 'out_of_service'),
        condition: pick(conditions),
        purchase_date: randomDate(30, 2000).slice(0, 10),
        last_maintenance: randomDate(0, 180).slice(0, 10),
        next_maintenance: randomDate(-60, 60).slice(0, 10),
        serial_number: 'SN-' + rand(100000, 999999),
      });
    }
    return equipment;
  }

  function generateUsers() {
    const roles = [
      { role: 'super_admin', email: 'admin@gympro.com', password: 'admin123', name: 'Alex Morgan' },
      { role: 'owner', email: 'owner@gympro.com', password: 'owner123', name: 'Sarah Johnson' },
      { role: 'branch_manager', email: 'manager@gympro.com', password: 'manager123', name: 'Michael Chen' },
      { role: 'receptionist', email: 'receptionist@gympro.com', password: 'reception123', name: 'Emily Davis' },
      { role: 'trainer', email: 'trainer@gympro.com', password: 'trainer123', name: 'David Wilson' },
      { role: 'accountant', email: 'accountant@gympro.com', password: 'account123', name: 'Lisa Brown' },
    ];
    const users = roles.map((r, i) => ({
      id: i + 1,
      full_name: r.name,
      email: r.email,
      password: r.password,
      role: r.role,
      branch_id: r.role === 'branch_manager' ? 1 : rand(1, 3),
      status: 'active',
      created_at: randomDate(30, 500).slice(0, 10),
    }));
    // Add a few extra staff users
    for (let i = 6; i < 20; i++) {
      const p = makePerson(i);
      const role = pick(['receptionist','trainer','accountant','branch_manager']);
users.push({
        id: i + 1,
        full_name: p.full_name,
        email: randomEmail(p.full_name, i),
        password: 'pass123',
        role,
        branch_id: rand(1, 3),
        status: 'active',
        created_at: randomDate(30, 500).slice(0, 10),
      });
    }
    return users;
  }

  function generateWorkoutPrograms() {
    return workoutNames.map((n, i) => ({
      id: i + 1,
      name: n,
      description: 'A structured ' + n.toLowerCase() + ' program designed for maximum results.',
      duration_weeks: rand(4, 12),
      difficulty: pick(['Beginner','Intermediate','Advanced']),
      trainer_id: rand(1, 40),
      sessions_per_week: rand(3, 6),
      created_by: 1,
    }));
  }

  function generateNutritionPlans() {
    return nutritionNames.map((n, i) => ({
      id: i + 1,
      name: n,
      description: 'Personalized ' + n.toLowerCase() + ' tailored to your fitness goals.',
      calories: rand(1800, 3200),
      protein: rand(80, 200),
      carbs: rand(100, 300),
      fats: rand(40, 100),
      duration_weeks: rand(4, 12),
      created_by: 1,
    }));
  }

function generateMeasurements(members) {
    const measurements = [];
    for (let i = 0; i < 100; i++) {
      const member = members[rand(0, members.length - 1)];
      measurements.push({
        id: i + 1,
        member_id: member.id,
        member_name: member.full_name,
        type: pick(measurementTypes),
        value: Number((Math.random() * 100 + 20).toFixed(1)),
        unit: pick(['kg','cm','%','in']),
        date: randomDate(0, 90).slice(0, 10),
        branch_id: member.branch_id,
      });
    }
    return measurements;
  }

  function generateDashboardActivities() {
    const activities = [
      { action: 'New member registered', user: 'Receptionist' },
      { action: 'Membership payment received', user: 'Accountant' },
      { action: 'Group class scheduled', user: 'Trainer' },
      { action: 'Inventory restocked', user: 'Branch Manager' },
      { action: 'Equipment maintenance completed', user: 'Maintenance' },
      { action: 'New membership plan created', user: 'Owner' },
      { action: 'Member checked in', user: 'Receptionist' },
      { action: 'Workout program updated', user: 'Trainer' },
    ];
    return activities.map((a, i) => ({
      id: i + 1,
      action: a.action,
      user: a.user,
      timestamp: randomDate(0, 7),
    }));
  }

  // Main: seed all collections if not present
  function seed() {
    const seeded = GymProDB.read('seeded');
    if (seeded) return;

const members = generateMembers(120);
    const trainers = generateTrainers(30);
    const plans = generatePlans();
    const branches = generateBranches();
    const attendance = generateAttendance(250, members);
    const payments = generatePayments(200, members);
    const classes = generateClasses(40);
    const inventory = generateInventory(60);
    const equipment = generateEquipment(50);

    GymProDB.write('members', members);
    GymProDB.write('trainers', trainers);
    GymProDB.write('plans', plans);
    GymProDB.write('branches', branches);
    GymProDB.write('attendance', attendance);
    GymProDB.write('payments', payments);
    GymProDB.write('classes', classes);
    GymProDB.write('inventory', inventory);
    GymProDB.write('equipment', equipment);
    GymProDB.write('users', generateUsers());
    GymProDB.write('workout_programs', generateWorkoutPrograms());
    GymProDB.write('nutrition_plans', generateNutritionPlans());
    GymProDB.write('measurements', generateMeasurements(members));
    GymProDB.write('activities', generateDashboardActivities());
    GymProDB.write('settings', {
      gym_name: 'GymPro Fitness Center',
      currency: 'USD',
      timezone: 'UTC',
      language: 'en',
      opened_at: dateDaysAgo(730).slice(0, 10),
    });
    GymProDB.write('seeded', true);
  }

  return { seed };
})();

window.GymProSeed = GymProSeed;
