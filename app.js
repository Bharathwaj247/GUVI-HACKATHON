const applicationData = {
  fleet_vehicles:[
    {id:"VH001",type:"Electric Bike",driver:"Ravi Kumar",capacity_kg:15,range_km:80,current_location:{lat:28.6139,lng:77.2090},status:"active",battery_level:85,avg_speed:25},
    {id:"VH002",type:"Auto Rickshaw",driver:"Priya Sharma",capacity_kg:50,range_km:120,current_location:{lat:19.076,lng:72.8777},status:"active",battery_level:null,avg_speed:20}
  ],
  delivery_orders:[
    {order_id:"ORD001",customer_name:"Rajesh Gupta",address:"123 MG Road, Connaught Place, New Delhi - 110001",payment_method:"COD",status:"assigned",assigned_vehicle:"VH001"},
    {order_id:"ORD002",customer_name:"Anita Singh",address:"456 Linking Road, Mumbai - 400001",payment_method:"Online",status:"assigned",assigned_vehicle:"VH002"}
  ],
  performance_metrics:{
    total_orders_today:127,
    delivered_successfully:98,
    in_transit:15,
    average_delivery_time:"2.4 hours"
  }
};

class DeliveryOptimizationApp {
  constructor(){
    this.currentSection='dashboard';
    this.map=null;
    this.routeMap=null;
    this.vehicleMarkers=[];
    this.init();
  }

  init(){
    this.setupEventListeners();
    this.initMaps();
    this.populateInitialData();
    this.initCharts();
  }

  setupEventListeners(){
    document.querySelectorAll('.nav-item').forEach(item=>{
      item.addEventListener('click', e=>{
        const section=e.currentTarget.dataset.section;
        this.switchSection(section);
      });
    });

    document.getElementById('optimize-routes-btn')?.addEventListener('click', ()=>this.optimizeRoutes());
    document.getElementById('dark-mode-toggle')?.addEventListener('click', ()=>document.body.classList.toggle('dark-mode'));
    document.getElementById('toggle-dark-mode')?.addEventListener('change', e=>document.body.classList.toggle('dark-mode', e.target.checked));
  }

  switchSection(section){
    document.querySelectorAll('.content-section').forEach(sec=>sec.classList.remove('active'));
    document.getElementById(section)?.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(nav=>nav.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
    if(section==='route-planner-section') setTimeout(()=>this.initRouteMap(),100);
  }

  initMaps(){
    if(document.getElementById('live-map')){
      this.map=L.map('live-map').setView([20.5937,78.9629],5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(this.map);
      this.addVehicleMarkers();
    }
  }

  initRouteMap(){
    if(document.getElementById('route-map') && !this.routeMap){
      this.routeMap=L.map('route-map').setView([28.6139,77.2090],10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(this.routeMap);
      this.addRouteVisualization();
    }
  }

  addVehicleMarkers(){
    this.vehicleMarkers.forEach(m=>this.map.removeLayer(m));
    this.vehicleMarkers=[];
    applicationData.fleet_vehicles.forEach(vehicle=>{
      const marker=L.marker([vehicle.current_location.lat,vehicle.current_location.lng])
        .bindPopup(`<strong>${vehicle.id} - ${vehicle.type}</strong><br>Driver: ${vehicle.driver}<br>Status: ${vehicle.status}<br>Speed: ${vehicle.avg_speed} km/h`)
        .addTo(this.map);
      this.vehicleMarkers.push(marker);
    });
  }

  addRouteVisualization(){
    const route=[[28.6139,77.2090],[28.6289,77.2295],[28.6419,77.2495],[28.6529,77.2595]];
    L.polyline(route,{color:'blue',weight:4}).addTo(this.routeMap);
    route.forEach((coord,i)=>L.marker(coord).bindPopup(`Stop ${i+1}`).addTo(this.routeMap));
  }

  populateInitialData(){
    this.populateMetrics();
    this.populateFleet();
    this.populateOrders();
  }

  populateMetrics(){
    const metrics=document.getElementById('dashboard-metrics');
    metrics.innerHTML='';
    const data=[
      {icon:'📦',value:applicationData.performance_metrics.total_orders_today,label:'Total Orders'},
      {icon:'✅',value:applicationData.performance_metrics.delivered_successfully,label:'Delivered'},
      {icon:'🚚',value:applicationData.performance_metrics.in_transit,label:'In Transit'},
      {icon:'⏱️',value:applicationData.performance_metrics.average_delivery_time,label:'Avg Time'}
    ];
    data.forEach(d=>{
      const card=document.createElement('div');
      card.className='metric-card';
      card.innerHTML=`<div class="metric-icon">${d.icon}</div>
        <div><div class="metric-value">${d.value}</div><div class="metric-label">${d.label}</div></div>`;
      metrics.appendChild(card);
    });
  }

  populateFleet(){
    const container=document.getElementById('fleet-status-list');
    container.innerHTML='';
    applicationData.fleet_vehicles.forEach(v=>{
      const card=document.createElement('div');
      card.className='metric-card mb-4';
      card.innerHTML=`<div class="metric-icon">🚚</div>
        <div><div class="metric-value">${v.id}</div><div class="metric-label">${v.type}</div>
        <p><strong>Driver:</strong> ${v.driver}</p>
        <p><strong>Capacity:</strong> ${v.capacity_kg} kg</p>
        ${v.battery_level ? `<p><strong>Battery:</strong> ${v.battery_level}%</p>` : ''}</div>`;
      container.appendChild(card);
    });
  }

  populateOrders(){
    const container=document.getElementById('recent-orders-list');
    container.innerHTML='';
    applicationData.delivery_orders.forEach(o=>{
      const card=document.createElement('div');
      card.className='metric-card mb-4';
      card.innerHTML=`<div class="metric-icon">📦</div>
        <div><div class="metric-value">${o.order_id}</div>
        <div class="metric-label">${o.customer_name}</div>
        <p><strong>Address:</strong> ${o.address}</p>
        <p><strong>Payment:</strong> ${o.payment_method}</p></div>`;
      container.appendChild(card);
    });
  }

  initCharts(){
    const perfCtx=document.getElementById('performance-chart');
    if(perfCtx){
      new Chart(perfCtx,{
        type:'line',
        data:{
          labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
          datasets:[{label:'Delivered Orders',data:[85,92,78,95,88,103,98],borderColor:'#1e40af',backgroundColor:'rgba(30,64,175,0.1)',fill:true}]
        }
      });
    }

    const ordersCtx=document.getElementById('orders-trend-chart');
    if(ordersCtx){
      new Chart(ordersCtx,{
        type:'bar',
        data:{labels:['Jan','Feb','Mar','Apr','May','Jun'],datasets:[{label:'Orders',data:[120,150,180,90,200,170],backgroundColor:'#059669'}]}
      });
    }

    const fleetCtx=document.getElementById('fleet-usage-chart');
    if(fleetCtx){
      new Chart(fleetCtx,{
        type:'doughnut',
        data:{labels:['VH001','VH002'],datasets:[{label:'Fleet Usage',data:[65,35],backgroundColor:['#1e40af','#f59e0b']}]}
      });
    }
  }

  optimizeRoutes(){
    const results=document.getElementById('optimization-results');
    results.innerHTML='<p>Optimized routes generated successfully! 🚀</p>';
    alert("Routes optimized!");
  }
}

// Initialize App
window.onload = ()=>{ new DeliveryOptimizationApp(); };
