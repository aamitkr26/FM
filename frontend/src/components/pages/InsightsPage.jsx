import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/card';
import { Search, X, MapPin, Gauge, Fuel, User, Wrench, FileText, DollarSign, Truck, Clock, Navigation2, Activity, Edit, Trash2, Map } from 'lucide-react';
export function InsightsPage({ onNavigate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showServiceBook, setShowServiceBook] = useState(false);
    // Complete Vehicle Data
    const vehicles = [
        {
            id: '1',
            number: 'HR55AN2175',
            manufacturer: 'tata',
            status: 'moving',
            statusText: 'Active',
            speed: 52,
            position: { top: '35%', left: '42%' },
            rotation: 135,
            address: 'NH-48, Delhi-Jaipur Highway, Haryana',
            lastUpdated: '2 mins ago',
            todayTrips: 3,
            todayDistance: '124 km',
            totalKm: '1500 km',
            driverName: 'John Doe',
            driverMobile: '9876543210',
            serviceDue: '15 days',
            cngPressure: '200 psi',
            vehicleModel: 'Model A',
            fuelLevel: '75%',
            odometer: '145,230 km',
            engineStatus: 'Running',
            temperature: '92°C',
            batteryVoltage: '13.8V',
            latitude: '28.4595',
            longitude: '77.0266',
            insurance: { status: 'valid', expiryDate: '15 Dec 2025', daysRemaining: 30 },
            pollution: { status: 'valid', expiryDate: '20 Mar 2026', daysRemaining: 125 },
            fitness: { status: 'valid', expiryDate: '20 Mar 2026', daysRemaining: 125 },
            tax: { status: 'paid', nextDueDate: '30 Mar 2026', amount: '₹12,500' },
            dieselExpense: { today: '₹1,850', thisMonth: '₹45,200' },
            tyreExpense: { lastReplacement: '5 Oct 2025', cost: '₹28,000' },
            avgSpeed: '48 km/h',
            maxSpeed: '85 km/h',
            totalRunningTime: '1,240 hrs',
            idleTime: '85 hrs'
        },
        {
            id: '2',
            number: 'HR47E2573',
            manufacturer: 'ashok',
            status: 'stopped',
            statusText: 'Stopped',
            speed: 0,
            position: { top: '40%', left: '50%' },
            rotation: 0,
            address: 'IFFCO Chowk, Gurugram, Haryana',
            lastUpdated: '15 mins ago',
            todayTrips: 2,
            todayDistance: '87 km',
            totalKm: '1200 km',
            driverName: 'Jane Smith',
            driverMobile: '9876543211',
            serviceDue: '20 days',
            cngPressure: '190 psi',
            vehicleModel: 'Model B',
            fuelLevel: '45%',
            odometer: '98,450 km',
            engineStatus: 'Stopped',
            temperature: '45°C',
            batteryVoltage: '12.4V',
            latitude: '28.4944',
            longitude: '77.0826',
            insurance: { status: 'expiring', expiryDate: '25 Nov 2025', daysRemaining: 10 },
            pollution: { status: 'valid', expiryDate: '5 Jan 2026', daysRemaining: 51 },
            fitness: { status: 'valid', expiryDate: '15 Feb 2026', daysRemaining: 92 },
            tax: { status: 'paid', nextDueDate: '15 Feb 2026', amount: '₹11,800' },
            dieselExpense: { today: '₹1,450', thisMonth: '₹38,900' },
            tyreExpense: { lastReplacement: '12 Sep 2025', cost: '₹26,500' },
            avgSpeed: '42 km/h',
            maxSpeed: '78 km/h',
            totalRunningTime: '980 hrs',
            idleTime: '120 hrs'
        },
        {
            id: '3',
            number: 'UP32BN9021',
            manufacturer: 'militrack',
            status: 'idling',
            statusText: 'Idle',
            speed: 0,
            position: { top: '38%', left: '54%' },
            rotation: 180,
            address: 'Greater Noida Industrial Area, UP',
            lastUpdated: '5 mins ago',
            todayTrips: 4,
            todayDistance: '156 km',
            totalKm: '1800 km',
            driverName: 'Alice Johnson',
            driverMobile: '9876543212',
            serviceDue: '10 days',
            cngPressure: '210 psi',
            vehicleModel: 'Model C',
            fuelLevel: '88%',
            odometer: '167,890 km',
            engineStatus: 'Idling',
            temperature: '68°C',
            batteryVoltage: '13.2V',
            latitude: '28.4744',
            longitude: '77.5040',
            insurance: { status: 'valid', expiryDate: '20 Feb 2026', daysRemaining: 97 },
            pollution: { status: 'expiring', expiryDate: '22 Nov 2025', daysRemaining: 7 },
            fitness: { status: 'valid', expiryDate: '10 Apr 2026', daysRemaining: 146 },
            tax: { status: 'paid', nextDueDate: '20 May 2026', amount: '₹13,200' },
            dieselExpense: { today: '₹2,100', thisMonth: '₹52,800' },
            tyreExpense: { lastReplacement: '18 Aug 2025', cost: '₹30,000' },
            avgSpeed: '51 km/h',
            maxSpeed: '92 km/h',
            totalRunningTime: '1,520 hrs',
            idleTime: '95 hrs'
        },
        {
            id: '4',
            number: 'MP04CE7712',
            manufacturer: 'tata',
            status: 'moving',
            statusText: 'Active',
            speed: 38,
            position: { top: '52%', left: '38%' },
            rotation: 270,
            address: 'Pithampur Industrial Area, MP',
            lastUpdated: '1 min ago',
            todayTrips: 2,
            todayDistance: '98 km',
            totalKm: '1600 km',
            driverName: 'Bob Brown',
            driverMobile: '9876543213',
            serviceDue: '25 days',
            cngPressure: '180 psi',
            vehicleModel: 'Model D',
            fuelLevel: '62%',
            odometer: '132,560 km',
            engineStatus: 'Running',
            temperature: '88°C',
            batteryVoltage: '13.6V',
            latitude: '22.6074',
            longitude: '75.7139',
            insurance: { status: 'valid', expiryDate: '5 Mar 2026', daysRemaining: 110 },
            pollution: { status: 'valid', expiryDate: '30 Jan 2026', daysRemaining: 76 },
            fitness: { status: 'valid', expiryDate: '15 Jun 2026', daysRemaining: 212 },
            tax: { status: 'paid', nextDueDate: '10 Jun 2026', amount: '₹12,000' },
            dieselExpense: { today: '₹1,650', thisMonth: '₹41,300' },
            tyreExpense: { lastReplacement: '3 Jul 2025', cost: '₹27,500' },
            avgSpeed: '45 km/h',
            maxSpeed: '82 km/h',
            totalRunningTime: '1,350 hrs',
            idleTime: '110 hrs'
        },
        {
            id: '5',
            number: 'MH12RK5521',
            manufacturer: 'ashok',
            status: 'stopped',
            statusText: 'Stopped',
            speed: 0,
            position: { top: '65%', left: '48%' },
            rotation: 0,
            address: 'Pune Industrial Estate, MH',
            lastUpdated: '8 mins ago',
            todayTrips: 3,
            todayDistance: '112 km',
            totalKm: '1700 km',
            driverName: 'Charlie Davis',
            driverMobile: '9876543214',
            serviceDue: '30 days',
            cngPressure: '195 psi',
            vehicleModel: 'Model E',
            fuelLevel: '55%',
            odometer: '156,780 km',
            engineStatus: 'Stopped',
            temperature: '52°C',
            batteryVoltage: '12.6V',
            latitude: '18.5204',
            longitude: '73.8567',
            insurance: { status: 'valid', expiryDate: '18 Jan 2026', daysRemaining: 64 },
            pollution: { status: 'valid', expiryDate: '28 Mar 2026', daysRemaining: 133 },
            fitness: { status: 'valid', expiryDate: '14 Feb 2027', daysRemaining: 456 },
            tax: { status: 'paid', nextDueDate: '28 Feb 2027', amount: '₹10,500' },
            dieselExpense: { today: '₹2,450', thisMonth: '₹62,300' },
            tyreExpense: { lastReplacement: '20 Sep 2025', cost: '₹32,000' },
            avgSpeed: '47 km/h',
            maxSpeed: '86 km/h',
            totalRunningTime: '1,410 hrs',
            idleTime: '102 hrs'
        },
        {
            id: '6',
            number: 'HR55AM8082',
            manufacturer: 'militrack',
            status: 'moving',
            statusText: 'Active',
            speed: 45,
            position: { top: '33%', left: '46%' },
            rotation: 90,
            address: 'Manesar Industrial Hub, Haryana',
            lastUpdated: '3 mins ago',
            todayTrips: 2,
            todayDistance: '76 km',
            totalKm: '1400 km',
            driverName: 'David Wilson',
            driverMobile: '9876543215',
            serviceDue: '5 days',
            cngPressure: '220 psi',
            vehicleModel: 'Model F',
            fuelLevel: '70%',
            odometer: '123,450 km',
            engineStatus: 'Running',
            temperature: '90°C',
            batteryVoltage: '13.7V',
            latitude: '28.3670',
            longitude: '76.9318',
            insurance: { status: 'valid', expiryDate: '8 May 2026', daysRemaining: 174 },
            pollution: { status: 'valid', expiryDate: '2 Apr 2026', daysRemaining: 138 },
            fitness: { status: 'valid', expiryDate: '22 Jul 2026', daysRemaining: 249 },
            tax: { status: 'paid', nextDueDate: '15 Jul 2026', amount: '₹11,200' },
            dieselExpense: { today: '₹1,320', thisMonth: '₹34,800' },
            tyreExpense: { lastReplacement: '9 Sep 2025', cost: '₹25,800' },
            avgSpeed: '49 km/h',
            maxSpeed: '88 km/h',
            totalRunningTime: '1,180 hrs',
            idleTime: '78 hrs'
        },
        {
            id: '7',
            number: 'MH14GT2299',
            manufacturer: 'ashok',
            status: 'idling',
            statusText: 'Idle',
            speed: 0,
            position: { top: '62%', left: '52%' },
            rotation: 45,
            address: 'Aurangabad MIDC, Maharashtra',
            lastUpdated: '6 mins ago',
            todayTrips: 3,
            todayDistance: '134 km',
            totalKm: '1650 km',
            driverName: 'Emma Martinez',
            driverMobile: '9876543216',
            serviceDue: '12 days',
            cngPressure: '205 psi',
            vehicleModel: 'Model G',
            fuelLevel: '80%',
            odometer: '149,320 km',
            engineStatus: 'Idling',
            temperature: '71°C',
            batteryVoltage: '13.4V',
            latitude: '19.8762',
            longitude: '75.3433',
            insurance: { status: 'valid', expiryDate: '12 Apr 2026', daysRemaining: 148 },
            pollution: { status: 'valid', expiryDate: '18 Feb 2026', daysRemaining: 95 },
            fitness: { status: 'valid', expiryDate: '5 Aug 2026', daysRemaining: 263 },
            tax: { status: 'paid', nextDueDate: '20 Aug 2026', amount: '₹12,800' },
            dieselExpense: { today: '₹1,780', thisMonth: '₹48,500' },
            tyreExpense: { lastReplacement: '15 Jun 2025', cost: '₹29,200' },
            avgSpeed: '50 km/h',
            maxSpeed: '91 km/h',
            totalRunningTime: '1,450 hrs',
            idleTime: '88 hrs'
        },
    ];
    // Fuel Consumption Data
    const fuelConsumptionData = [
        { month: 'Jan', consumption: 4500, cost: 450000 },
        { month: 'Feb', consumption: 4800, cost: 480000 },
        { month: 'Mar', consumption: 5200, cost: 520000 },
        { month: 'Apr', consumption: 4900, cost: 490000 },
        { month: 'May', consumption: 5500, cost: 550000 },
        { month: 'Jun', consumption: 5800, cost: 580000 },
    ];
    // ServiceBook Data
    const serviceBookData = [
        { name: 'Perfectly Fine', value: 52, color: '#27AE60' },
        { name: 'Ongoing', value: 18, color: '#0D47A1' },
        { name: 'Due', value: 22, color: '#F2B233' },
        { name: 'Pending', value: 8, color: '#E53935' },
    ];
    // Service Records Data
    const serviceRecords = [
        {
            id: 1,
            vehicleNumber: 'UP16LT6628',
            manufacturer: 'tata',
            mileage: '89,650 km',
            serviceType: 'E Breakdown',
            bookingDate: 'NA',
            kmsRun: 'NA',
            workshopName: 'TRIUMPH AUTO (CV) PVT LTD',
            workshopContact: 'NA',
            srNumber: 'SR-TrpLsd/DP1-2526-004631',
            workshopEmail: 'NA'
        },
        {
            id: 2,
            vehicleNumber: 'RI40PA2171',
            manufacturer: 'tata',
            mileage: '85,600 km',
            serviceType: 'DEF Only',
            bookingDate: 'NA',
            kmsRun: '112',
            workshopName: 'SISOTHYA AUTOMOBILES-2089426',
            workshopContact: 'NA',
            srNumber: 'SR-SisOH/RP2-2324-027058',
            workshopEmail: 'NA'
        },
        {
            id: 3,
            vehicleNumber: 'HR55AN2175',
            manufacturer: 'tata',
            mileage: '78,900 km',
            serviceType: 'DEF Only',
            bookingDate: 'NA',
            kmsRun: 'NA',
            workshopName: 'PASCO MOTORS LLP',
            workshopContact: '9840927902',
            srNumber: 'SR-PasMau/GP1-2324-005583',
            workshopEmail: 'NA'
        },
    ];
    // Distance Traveled Data
    const distanceTraveledData = [
        { month: 'Jan', distance: 45000 },
        { month: 'Feb', distance: 48000 },
        { month: 'Mar', distance: 52000 },
        { month: 'Apr', distance: 49000 },
        { month: 'May', distance: 55000 },
        { month: 'Jun', distance: 58000 },
    ];
    // Cost Analysis Data
    const costAnalysisData = [
        { category: 'Fuel', amount: 580000 },
        { category: 'Maintenance', amount: 120000 },
        { category: 'Insurance', amount: 80000 },
        { category: 'Salary', amount: 450000 },
        { category: 'Others', amount: 70000 },
    ];
    // Driver Performance Data
    const driverPerformanceData = [
        { week: 'Week 1', avgSpeed: 45, safety: 92, efficiency: 88 },
        { week: 'Week 2', avgSpeed: 48, safety: 90, efficiency: 87 },
        { week: 'Week 3', avgSpeed: 46, safety: 93, efficiency: 90 },
        { week: 'Week 4', avgSpeed: 47, safety: 91, efficiency: 89 },
    ];
    const handleSearch = () => {
        const vehicle = vehicles.find(v => v.number.toUpperCase() === searchQuery.toUpperCase());
        if (vehicle) {
            setSelectedVehicle(vehicle);
            setShowPopup(true);
        }
        else {
            alert('Vehicle not found. Please check the vehicle number.');
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'moving':
                return '#27AE60';
            case 'stopped':
                return '#E53935';
            case 'idling':
                return '#F2B233';
            default:
                return '#67727E';
        }
    };
    const getComplianceColor = (status) => {
        if (status === 'valid' || status === 'paid')
            return '#27AE60';
        if (status === 'expiring')
            return '#F2B233';
        return '#E53935';
    };
    return (<div className="w-full h-full overflow-y-auto bg-[#F5F7FA] p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#2A3547] mb-2">Fleet Insights & Analytics</h1>
          <p className="text-[#67727E]">Comprehensive performance metrics and data visualization</p>
        </div>

        {/* Search Section */}
        <Card className="p-6 border border-[#E1E6EF] bg-white">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input type="text" placeholder="Enter vehicle number (e.g., HR55AN2175)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} className="w-full px-4 py-3 pr-12 border border-[#E1E6EF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D47A1] transition-all" style={{
            fontFamily: 'Inter',
            fontSize: '15px',
            color: '#2A3547'
        }}/>
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#67727E] cursor-pointer hover:text-[#0D47A1] transition-colors" size={20} onClick={handleSearch}/>
            </div>
            <button onClick={handleSearch} className="px-6 py-3 bg-[#0D47A1] text-white rounded-lg hover:bg-[#0D47A1]/90 transition-colors flex items-center gap-2" style={{
            fontFamily: 'Inter',
            fontSize: '15px',
            fontWeight: 600
        }}>
              <Search size={18}/>
              Search Vehicle
            </button>
          </div>
        </Card>

        {/* Charts Grid - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fuel Consumption Chart */}
          <Card className="p-6 border border-[#E1E6EF] bg-white">
            <h3 className="text-[#2A3547] mb-1" style={{ fontWeight: 600, fontSize: '18px' }}>
              Fuel Consumption & Cost
            </h3>
            <p className="text-[#67727E] text-sm mb-6">Monthly fuel usage and expenses</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={fuelConsumptionData}>
                <defs>
                  <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0D47A1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E6EF"/>
                <XAxis dataKey="month" stroke="#67727E" style={{ fontSize: '12px' }}/>
                <YAxis stroke="#67727E" style={{ fontSize: '12px' }}/>
                <Tooltip contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E1E6EF',
            borderRadius: '8px',
            fontSize: '12px'
        }}/>
                <Legend wrapperStyle={{ fontSize: '12px' }}/>
                <Area type="monotone" dataKey="consumption" stroke="#0D47A1" fillOpacity={1} fill="url(#colorConsumption)" name="Consumption (L)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* ServiceBook Chart */}
          <Card className="p-6 border border-[#E1E6EF] bg-white relative">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[#2A3547]" style={{ fontWeight: 600, fontSize: '18px' }}>
                ServiceBook
              </h3>
              <button onClick={() => setShowServiceBook(true)} className="px-4 py-2 bg-[#27AE60] text-white rounded-lg hover:bg-[#27AE60]/90 transition-colors flex items-center gap-2" style={{
            fontFamily: 'Inter',
            fontSize: '14px',
            fontWeight: 600
        }}>
                <Wrench size={16}/>
                Service Book
              </button>
            </div>
            <p className="text-[#67727E] text-sm mb-6">Vehicle service status overview</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={serviceBookData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {serviceBookData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color}/>))}
                </Pie>
                <Tooltip contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E1E6EF',
            borderRadius: '8px',
            fontSize: '12px'
        }}/>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Grid - Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distance Traveled Chart */}
          <Card className="p-6 border border-[#E1E6EF] bg-white">
            <h3 className="text-[#2A3547] mb-1" style={{ fontWeight: 600, fontSize: '18px' }}>
              Distance Traveled
            </h3>
            <p className="text-[#67727E] text-sm mb-6">Total kilometers covered per month</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={distanceTraveledData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E6EF"/>
                <XAxis dataKey="month" stroke="#67727E" style={{ fontSize: '12px' }}/>
                <YAxis stroke="#67727E" style={{ fontSize: '12px' }}/>
                <Tooltip contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E1E6EF',
            borderRadius: '8px',
            fontSize: '12px'
        }}/>
                <Legend wrapperStyle={{ fontSize: '12px' }}/>
                <Line type="monotone" dataKey="distance" stroke="#8E24AA" strokeWidth={3} name="Distance (km)" dot={{ fill: '#8E24AA', r: 5 }} activeDot={{ r: 7 }}/>
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Cost Analysis Chart */}
          <Card className="p-6 border border-[#E1E6EF] bg-white">
            <h3 className="text-[#2A3547] mb-1" style={{ fontWeight: 600, fontSize: '18px' }}>
              Cost Breakdown Analysis
            </h3>
            <p className="text-[#67727E] text-sm mb-6">Monthly operational expenses by category</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costAnalysisData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E6EF"/>
                <XAxis type="number" stroke="#67727E" style={{ fontSize: '12px' }}/>
                <YAxis type="category" dataKey="category" stroke="#67727E" style={{ fontSize: '12px' }}/>
                <Tooltip contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E1E6EF',
            borderRadius: '8px',
            fontSize: '12px'
        }} formatter={(value) => `₹${(value / 1000).toFixed(0)}K`}/>
                <Bar dataKey="amount" fill="#F2B233" name="Amount (₹)" radius={[0, 8, 8, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Grid - Row 3 */}
        <div className="grid grid-cols-1 gap-6">
          {/* Driver Performance Chart */}
          <Card className="p-6 border border-[#E1E6EF] bg-white">
            <h3 className="text-[#2A3547] mb-1" style={{ fontWeight: 600, fontSize: '18px' }}>
              Driver Performance Metrics
            </h3>
            <p className="text-[#67727E] text-sm mb-6">Weekly safety and efficiency scores</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={driverPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E6EF"/>
                <XAxis dataKey="week" stroke="#67727E" style={{ fontSize: '12px' }}/>
                <YAxis stroke="#67727E" style={{ fontSize: '12px' }}/>
                <Tooltip contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E1E6EF',
            borderRadius: '8px',
            fontSize: '12px'
        }}/>
                <Legend wrapperStyle={{ fontSize: '12px' }}/>
                <Line type="monotone" dataKey="safety" stroke="#27AE60" strokeWidth={2} name="Safety Score" dot={{ fill: '#27AE60', r: 4 }}/>
                <Line type="monotone" dataKey="efficiency" stroke="#0D47A1" strokeWidth={2} name="Efficiency Score" dot={{ fill: '#0D47A1', r: 4 }}/>
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Vehicle Details Popup */}
      {showPopup && selectedVehicle && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={() => setShowPopup(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0D47A1] to-[#1976D2] p-6 text-white relative">
              <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24}/>
              </button>
              {onNavigate && (<button onClick={() => {
                    setShowPopup(false);
                    onNavigate('dashboard', selectedVehicle.id);
                }} className="absolute top-4 right-16 px-4 py-2 bg-[#27AE60] hover:bg-[#27AE60]/90 rounded-lg transition-colors flex items-center gap-2" style={{
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    fontWeight: 600
                }}>
                  <Map size={18}/>
                  See On Map
                </button>)}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Truck size={32}/>
                </div>
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Inter' }}>
                    {selectedVehicle.number}
                  </h2>
                  <p style={{ fontSize: '14px', opacity: 0.9 }}>
                    Complete Vehicle Information & Telematics
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Status Bar */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-[#F5F7FA] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={18} style={{ color: getStatusColor(selectedVehicle.status) }}/>
                    <span className="text-[#67727E] text-sm">Status</span>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: getStatusColor(selectedVehicle.status) }}>
                    {selectedVehicle.statusText}
                  </p>
                </div>
                <div className="p-4 bg-[#F5F7FA] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge size={18} className="text-[#0D47A1]"/>
                    <span className="text-[#67727E] text-sm">Speed</span>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#2A3547' }}>
                    {selectedVehicle.speed} km/h
                  </p>
                </div>
                <div className="p-4 bg-[#F5F7FA] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Fuel size={18} className="text-[#27AE60]"/>
                    <span className="text-[#67727E] text-sm">Fuel Level</span>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#2A3547' }}>
                    {selectedVehicle.fuelLevel}
                  </p>
                </div>
                <div className="p-4 bg-[#F5F7FA] rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={18} className="text-[#F2B233]"/>
                    <span className="text-[#67727E] text-sm">Last Update</span>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#2A3547' }}>
                    {selectedVehicle.lastUpdated}
                  </p>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Vehicle Information */}
                  <Card className="p-5 border border-[#E1E6EF]">
                    <h3 className="text-[#2A3547] mb-4 flex items-center gap-2" style={{ fontWeight: 600, fontSize: '16px' }}>
                      <Truck size={18} className="text-[#0D47A1]"/>
                      Vehicle Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Vehicle Model</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.vehicleModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Manufacturer</span>
                        <span className="text-[#2A3547] font-medium uppercase">{selectedVehicle.manufacturer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Odometer</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.odometer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Total Distance</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.totalKm}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Engine Status</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.engineStatus}</span>
                      </div>
                    </div>
                  </Card>

                  {/* GPS & Location */}
                  <Card className="p-5 border border-[#E1E6EF]">
                    <h3 className="text-[#2A3547] mb-4 flex items-center gap-2" style={{ fontWeight: 600, fontSize: '16px' }}>
                      <MapPin size={18} className="text-[#E53935]"/>
                      GPS & Location
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Current Address</span>
                      </div>
                      <p className="text-[#2A3547] font-medium text-sm">{selectedVehicle.address}</p>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Latitude</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.latitude}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Longitude</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.longitude}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Driver Details */}
                  <Card className="p-5 border border-[#E1E6EF]">
                    <h3 className="text-[#2A3547] mb-4 flex items-center gap-2" style={{ fontWeight: 600, fontSize: '16px' }}>
                      <User size={18} className="text-[#8E24AA]"/>
                      Driver Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Driver Name</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.driverName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Contact</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.driverMobile}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Telematics Data */}
                  <Card className="p-5 border border-[#E1E6EF]">
                    <h3 className="text-[#2A3547] mb-4 flex items-center gap-2" style={{ fontWeight: 600, fontSize: '16px' }}>
                      <Gauge size={18} className="text-[#F2B233]"/>
                      Telematics Data
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Engine Temperature</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.temperature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Battery Voltage</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.batteryVoltage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">CNG Pressure</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.cngPressure}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Avg Speed</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.avgSpeed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Max Speed</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.maxSpeed}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Today's Activity */}
                  <Card className="p-5 border border-[#E1E6EF]">
                    <h3 className="text-[#2A3547] mb-4 flex items-center gap-2" style={{ fontWeight: 600, fontSize: '16px' }}>
                      <Navigation2 size={18} className="text-[#27AE60]"/>
                      Today&apos;s Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Trips Completed</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.todayTrips}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Distance Covered</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.todayDistance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Running Time</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.totalRunningTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Idle Time</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.idleTime}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Fuel & Expenses */}
                  <Card className="p-5 border border-[#E1E6EF]">
                    <h3 className="text-[#2A3547] mb-4 flex items-center gap-2" style={{ fontWeight: 600, fontSize: '16px' }}>
                      <DollarSign size={18} className="text-[#27AE60]"/>
                      Fuel & Expenses
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Today&apos;s Fuel Cost</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.dieselExpense.today}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">This Month</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.dieselExpense.thisMonth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Last Tyre Change</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.tyreExpense.lastReplacement}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Tyre Cost</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.tyreExpense.cost}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Compliance & Documents */}
                  <Card className="p-5 border border-[#E1E6EF]">
                    <h3 className="text-[#2A3547] mb-4 flex items-center gap-2" style={{ fontWeight: 600, fontSize: '16px' }}>
                      <FileText size={18} className="text-[#0D47A1]"/>
                      Compliance & Documents
                    </h3>
                    <div className="space-y-4">
                      {/* Insurance */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[#67727E] text-sm">Insurance</span>
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                backgroundColor: getComplianceColor(selectedVehicle.insurance.status) + '20',
                color: getComplianceColor(selectedVehicle.insurance.status)
            }}>
                            {selectedVehicle.insurance.status}
                          </span>
                        </div>
                        <p className="text-[#2A3547] text-sm">Expiry: {selectedVehicle.insurance.expiryDate}</p>
                        <p className="text-[#67727E] text-xs">{selectedVehicle.insurance.daysRemaining} days remaining</p>
                      </div>

                      {/* Pollution */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[#67727E] text-sm">Pollution (PUC)</span>
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                backgroundColor: getComplianceColor(selectedVehicle.pollution.status) + '20',
                color: getComplianceColor(selectedVehicle.pollution.status)
            }}>
                            {selectedVehicle.pollution.status}
                          </span>
                        </div>
                        <p className="text-[#2A3547] text-sm">Expiry: {selectedVehicle.pollution.expiryDate}</p>
                        <p className="text-[#67727E] text-xs">{selectedVehicle.pollution.daysRemaining} days remaining</p>
                      </div>

                      {/* Fitness */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[#67727E] text-sm">Fitness Certificate</span>
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                backgroundColor: getComplianceColor(selectedVehicle.fitness.status) + '20',
                color: getComplianceColor(selectedVehicle.fitness.status)
            }}>
                            {selectedVehicle.fitness.status}
                          </span>
                        </div>
                        <p className="text-[#2A3547] text-sm">Expiry: {selectedVehicle.fitness.expiryDate}</p>
                        <p className="text-[#67727E] text-xs">{selectedVehicle.fitness.daysRemaining} days remaining</p>
                      </div>

                      {/* Tax */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[#67727E] text-sm">Road Tax</span>
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                backgroundColor: getComplianceColor(selectedVehicle.tax.status) + '20',
                color: getComplianceColor(selectedVehicle.tax.status)
            }}>
                            {selectedVehicle.tax.status}
                          </span>
                        </div>
                        <p className="text-[#2A3547] text-sm">Next Due: {selectedVehicle.tax.nextDueDate}</p>
                        <p className="text-[#67727E] text-xs">Amount: {selectedVehicle.tax.amount}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Maintenance */}
                  <Card className="p-5 border border-[#E1E6EF]">
                    <h3 className="text-[#2A3547] mb-4 flex items-center gap-2" style={{ fontWeight: 600, fontSize: '16px' }}>
                      <Wrench size={18} className="text-[#E53935]"/>
                      Maintenance
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#67727E] text-sm">Next Service Due</span>
                        <span className="text-[#2A3547] font-medium">{selectedVehicle.serviceDue}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>)}

      {/* Service Book Popup */}
      {showServiceBook && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={() => setShowServiceBook(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] p-6 text-white relative">
              <button onClick={() => setShowServiceBook(false)} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24}/>
              </button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Wrench size={32}/>
                </div>
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Inter' }}>
                    Service Book
                  </h2>
                  <p style={{ fontSize: '14px', opacity: 0.9 }}>
                    Complete vehicle service records and maintenance history
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Service Records Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F5F7FA] border-b border-[#E1E6EF]">
                      <th className="px-4 py-3 text-left text-[#2A3547] text-sm font-semibold">S.No</th>
                      <th className="px-4 py-3 text-left text-[#2A3547] text-sm font-semibold">Reg. No</th>
                      <th className="px-4 py-3 text-left text-[#2A3547] text-sm font-semibold">Make</th>
                      <th className="px-4 py-3 text-left text-[#2A3547] text-sm font-semibold">Mileage</th>
                      <th className="px-4 py-3 text-left text-[#2A3547] text-sm font-semibold">Service Type</th>
                      <th className="px-4 py-3 text-left text-[#2A3547] text-sm font-semibold">Booking Date</th>
                      <th className="px-4 py-3 text-left text-[#2A3547] text-sm font-semibold">Kms Run</th>
                      <th className="px-4 py-3 text-left text-[#2A3547] text-sm font-semibold">Workshop Name</th>
                      <th className="px-4 py-3 text-left text-[#2A3547] text-sm font-semibold">Contact</th>
                      <th className="px-4 py-3 text-left text-[#2A3547] text-sm font-semibold">SR Number</th>
                      <th className="px-4 py-3 text-left text-[#2A3547] text-sm font-semibold">Email</th>
                      <th className="px-4 py-3 text-left text-[#2A3547] text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRecords.map((record, index) => (<tr key={record.id} className="border-b border-[#E1E6EF] hover:bg-[#F9FBFF] transition-colors">
                        <td className="px-4 py-4 text-[#2A3547] text-sm">{index + 1}</td>
                        <td className="px-4 py-4 text-[#2A3547] text-sm font-medium">{record.vehicleNumber}</td>
                        <td className="px-4 py-4 text-[#2A3547] text-sm uppercase">{record.manufacturer}</td>
                        <td className="px-4 py-4 text-[#2A3547] text-sm">{record.mileage}</td>
                        <td className="px-4 py-4 text-sm">
                          <span className="px-2 py-1 bg-[#0D47A1]/10 text-[#0D47A1] rounded-md text-xs">
                            {record.serviceType}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#67727E] text-sm">{record.bookingDate}</td>
                        <td className="px-4 py-4 text-[#67727E] text-sm">{record.kmsRun}</td>
                        <td className="px-4 py-4 text-[#2A3547] text-sm max-w-xs truncate">{record.workshopName}</td>
                        <td className="px-4 py-4 text-[#67727E] text-sm">{record.workshopContact}</td>
                        <td className="px-4 py-4 text-[#2A3547] text-sm font-mono text-xs">{record.srNumber}</td>
                        <td className="px-4 py-4 text-[#67727E] text-sm">{record.workshopEmail}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-[#0D47A1]/10 rounded-lg transition-colors" title="Edit">
                              <Edit size={16} className="text-[#0D47A1]"/>
                            </button>
                            <button className="p-2 hover:bg-[#E53935]/10 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={16} className="text-[#E53935]"/>
                            </button>
                          </div>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>)}
    </div>);
}
