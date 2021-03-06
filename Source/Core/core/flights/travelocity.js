var travelocityManager = function(footprintCore, settingsProvider){
  this.core = footprintCore;
  this.settingsProvider = settingsProvider;
  this.validator = new FlightsValidator("travelocity");
};

/**
* Function for making an object of flight
* @return array of Object
*/

travelocityManager.prototype.getList = function(){
    //console.log("Hey Cleartrip!");
    var rawList = document.getElementsByClassName('flight-module segment offer-listing');
    console.log("--raw list--");
    //console.log(rawList);
    var processedList = [];
    var route,airports=[],depart,arrive,stops=[];
    for(var x=0; x< rawList.length; x++){
        details = this.validator.getByClass('primary-block', rawList[x]);
        //console.log(rawList);
        airports = this.validator.getByClass('secondary', details[1])[0].innerText;
        //console.log(airports);
        check = this.validator.getByClass('primary', details[2])[0].innerText;
        //console.log(check);
        check = check.split(" ");
        //console.log(check);
        if(check.length===1){
            stops = [];
            //console.log("no stops");
        }
        else{
            stops = this.validator.getByClass('secondary', details[2])[0].innerText;
            //console.log(stops);
            if(parseInt(check[0]) == 1){
            stops = stops.split(" ");
                stops = stops[stops.length-1];
                stops = [stops];
         }
            else{
                //console.log(stops);
            stops = stops.split(",").join("").split(" ");
         }
        }
        route = airports.split(" ").join("").split("-");
        depart = route[0];
        arrive = route[1];
        //console.log(depart,arrive);
        processedList.push({
            depart: depart,
            arrive :arrive,
            stops:stops,
            aircraft: "A380"
        });
        //console.log(stops);
    }
    this.validator.verifyList(processedList);
    console.log(processedList);
    return processedList;
};

/**
* Function for inserting Element in DOM
* @param array
* @return array
*/

travelocityManager.prototype.insertInDom = function(processedList){
  if(processedList.length){
    var checkOption = this.validator.getByClass('details-holder');
    var insertIn = [];
    console.log(checkOption);
    console.log(processedList);
    for(var x=0;x<checkOption.length;x++){
        console.log(checkOption[x].getElementsByClassName('carbon'));
        insertIn = checkOption[x];
        console.log(x);
        if(checkOption[x].getElementsByClassName('carbon').length < 1)
        {
            console.log("here we are");
            console.log(insertIn);
            insertIn.appendChild(this.core.createMark(processedList[x].co2Emission,0));
        }
        else{
            console.log("saved");
        }
    }
  }
};

var WebsiteManager = travelocityManager ;
