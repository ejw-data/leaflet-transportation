// Sidebar open/close
function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
  document.getElementById("sidebarBttn").style.display="none";
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft= "0";
  document.getElementById("sidebarBttn").style.display="block";
}

// Sidebar submit button clicked
function raceForm(){
    race()
    return false;
}



// Create dropdowns 
sidebarDropDown('#startState', '#startCity')
sidebarDropDown('#endState', '#endCity')

function sidebarDropDown(state, city){
    let selectState = d3.select(state);
    d3.json('/api/v1.0/states').then(data => {
        data.forEach(i => {
            selectState.append('option')
                .text(i)
                .attr('value', i)
        })
    })

    selectState.on('change', function(){return updateCities(state, city)})
    updateCities(state, city)
}

function updateCities(state, city){

    let selectCity = d3.select(city);
    let stateSelected = d3.select(state).property("value");

    if(stateSelected ==""){
        stateSelected = "Alabama"
    }
    d3.json('/api/v1.0/cities').then(data => {
        let stateFilter = data.filter(i => i.state == stateSelected);

        let city_array = stateFilter.map(i => i.city)

        selectCity.html("");
        city_array.forEach(i => {
            selectCity.append('option')
                    .text(i)
                    .attr('value', i)
        })

    })
}