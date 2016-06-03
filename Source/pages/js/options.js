var optionsData;

var currencyCodes = ["AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN","BAM","BBD","BDT","BGN","BHD","BIF","BMD","BND","BOB","BOV","BRL","BSD","BTN","BWP","BYR","BZD","CAD","CDF","CHE","CHF","CHW","CLF","CLP","CNY","COP","COU","CRC","CUP","CVE","CYP","CZK","DJF","DKK","DOP","DZD","EEK","EGP","ERN","ETB","EUR","FJD","FKP","GBP","GEL","GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HRK","HTG","HUF","IDR","ILS","INR","IQD","IRR","ISK","JMD","JOD","JPY","KES","KGS","KHR","KMF","KPW","KRW","KWD","KYD","KZT","LAK","LBP","LKR","LRD","LSL","LTL","LVL","LYD","MAD","MDL","MGA","MKD","MMK","MNT","MOP","MRO","MTL","MUR","MVR","MWK","MXN","MXV","MYR","MZN","NAD","NGN","NIO","NOK","NPR","NZD","OMR","PAB","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR","SBD","SCR","SDG","SEK","SGD","SHP","SKK","SLL","SOS","SRD","STD","SYP","SZL","THB","TJS","TMM","TND","TOP","TRY","TTD","TWD","TZS","UAH","UGX","USD","USN","USS","UYU","UZS","VEB","VND","VUV","WST","XAF","XAG","XAU","XBA","XBB","XBC","XBD","XCD","XDR","XFO","XFU","XOF","XPD","XPF","XPT","XTS","XXX","YER","ZAR","ZMK","ZWD"];

//function to switch between tabs and open respective inputs
/*function openEmissionInput()
{
  //adding selected class to the clicked tab
  $('.emission-input-type.selected').removeClass('selected');
  $(this).addClass(' selected');
 //opening input to the corresponding tab
  var index = $('.emission-input-type.selected').index();
  $('.emission-input.open').removeClass('open');
  $('.emission-input:nth-child('+(index+1)+')').addClass('open');
 }*/

function switchtab(){
  $('.tab-button.selected').removeClass('selected');
  $(this).addClass(' selected');  
  var index = $('.tab-button.selected').index();
  $('.tab.open').removeClass('open');
  $('.tab:nth-child('+(index+1)+')').addClass('open');
  
}

// Function to handle all 3 tabs save  click
function saveOptions() {
  //Saving input type
  optionsData.set('savedTab',$('.emission-input.open').index());
  // Saving PRIMITVE VARIABLES- fuelType
  optionsData.set('fuelType',parseInt(document.getElementById("fuel-type").value));
  // Saving PRIMITVE VARIABLES- fuelCost

  optionsData.set('fuelCost',{
    value: parseFloat(document.getElementById("fuel-cost").value),
    unit1: '$',
    unit2: document.getElementById("fuel-cost-unit2").value,
  });
  /**
  * TO STORE EVERYTYPE OF INFO IN TERMS OF PRIMITVE VARIABLES-
  * fuelConsumption
  */
  switch(optionsData.get('savedTab'))
  {
    case 0: optionsData.set('fuelConsumption',{
              'value': parseFloat($('#consumption').val()),
              'unit1': $('#consumption-unit1').val(), 
              'unit2': $('#consumption-unit2').val(),
            });
            setEmissionRate('g',$('#consumption-unit2').val());
            break;
    case 1: //As fuel consumption = 1/fuel efficiency
            if( !Number.isFinite( 1/$('#efficiency').val() ) ) {
                alert('Fuel efficiency cannot be 0!');
                return;
            }
            optionsData.set('fuelConsumption',{  
              'value': 1/$('#efficiency').val(),
              'unit1': $('#efficiency-unit2').val(), 
              'unit2': $('#efficiency-unit1').val(),
            });  
            setEmissionRate('g',$('#efficiency-unit1').val());
            break;
    case 2: 
            var emission = $('#emission').val(),
                emissionUnit1 = $('#emission-unit1').val(), 
                emissionUnit2 = $('#emission-unit2').val();
            // CONVERSION TO GRAMS  
            emission = Utils.Converter.convert(emission,emissionUnit1,'g')
            // Conversion to fuel efficiency based on fuel type
            var fuelType = optionsData.get('fuelType');
            emission = emission / Utils.fuelInfo[fuelType]['CO2Emission'];

            optionsData.set('fuelConsumption',{
              'value': emission,
              'unit1': 'L', 
              'unit2': emissionUnit2,
            }); 
            // Set emission rate
            setEmissionRate(emissionUnit1,emissionUnit2);
            break;
  }
  //function call to calculate travel rate
  setTravelRate();
  optionsData.store();
  // Update status to let user know options were saved.
  var status = $('#save-message');
  status.html('Saved!');
  setTimeout(function() {
    status.html('');
  }, 750);
}


//function to set emission rate
function setEmissionRate(mUnit,dUnit) {
  var fuelType = optionsData.get('fuelType');
  var consumptionObj = optionsData.get('fuelConsumption');
  var emissionRate = consumptionObj.value;

  //CONVERSION TO STANDARD UNIT AS DATA IS AVAILABLE  IN GRAM/LITER
  // Converts multiplicative unit to Liter
  //NOW CONVERTING THE FUEL EFFICIENCY (NOW IN L/KM) TO CARBON EMISSION (in G/KM) for particular fuel type
  emissionRate = Utils.fuelInfo[fuelType]['CO2Emission'] * Utils.Converter.convert(emissionRate,consumptionObj.unit1,'L',consumptionObj.unit2,'km');

  //save the unit for output
  optionsData.set('emissionDisplayUnit',mUnit);

  //save rate in g/km
  optionsData.set('emissionRate', Math.round(emissionRate * 10000) / 10000);
}

//function to set emission rate
function setTravelRate() {
  var fuelCostObj = optionsData.get('fuelCost');
  var consumptionObj = optionsData.get('fuelConsumption');
  var fuelRate = null;

  //cost($/volume) and consumption (volume/distance)
  fuelRate = fuelCostObj['value'] * Utils.Converter.convert(consumptionObj['value'],consumptionObj['unit1'],fuelCostObj['unit2'],consumptionObj['unit2'],'km');

  //Fetching display travel cost checkbox value
  var displayTravelCost = document.getElementById("display-travel-cost").checked;

  optionsData.set('travelRate', Math.round(fuelRate * 10000) / 10000 );
  optionsData.set('showTravelCost', displayTravelCost);
}


// function to store value on unit change
(function () {
    var previous;
    // console.log('yo',$(".selectMUnit"));
    $(".selectMUnit,.selectDUnit,.selectFUnit").on('focus', function () {
        // Store the current value on focus and on change
        previous = this.value;
    }).change(function() {
        // var to store respective input field and changing via generalised function 
        var inputField;
        if($(this).hasClass('selectMUnit')) {
          inputField = $($(this).parents('.form-group').siblings()[0]).find('input');
          inputField.val(Utils.Converter.convert(inputField.val(),previous,this.value,'none','none'));
        }
        else if($(this).hasClass('selectDUnit')) {
          inputField = $($(this).parents('.form-group').siblings()[0]).find('input');
          inputField.val(Utils.Converter.convert(inputField.val(),'none','none',previous,this.value));
        }
        else if($(this).hasClass('selectFUnit')) {
          inputField = $(this).parents('.form-group').find('input');
          inputField.val(Utils.Converter.convert(inputField.val(),'none','none',previous,this.value));
        }
        // Make sure the previous value is updated
        previous = this.value;
    });
})();

function loadOldData() {
    //restore only if options html was saved once
    if(optionsData.has('savedTab')) {
        // Fuel type restore
        $('#fuel-type').val(optionsData.get('fuelType'));
        // Fuel Cost restore
        $('#fuel-cost').val(optionsData.get('fuelCost')['value']);
        $('#fuel-cost-unit2').val(optionsData.get('fuelCost')['unit2']);
        //  Storing input field on type
        $($('.emission-input-type')[optionsData.get('savedTab')]).click();

        $('#display-travel-cost').attr('checked', optionsData.get('showTravelCost'));

        switch(optionsData.get('savedTab')) {
          case 0 :  $('#consumption').val(optionsData.get('fuelConsumption')['value']);
                    $('#consumption-unit1').val(optionsData.get('fuelConsumption')['unit1']);
                    $('#consumption-unit2').val(optionsData.get('fuelConsumption')['unit2']);
                    break;

          case 1 :  $('#efficiency').val( 1 / optionsData.get('fuelConsumption')['value']);
                    $('#efficiency-unit1').val(optionsData.get('fuelConsumption')['unit2']);
                    $('#efficiency-unit2').val(optionsData.get('fuelConsumption')['unit1']);
                    break;

          case 2 :  var emissionVal = Utils.Converter.convert(optionsData.get('emissionRate'),'g',optionsData.get('emissionDisplayUnit'),'km',optionsData.get('fuelConsumption')['unit2']);
                    $('#emission').val(Math.round(emissionVal*100)/100);
                    $('#emission-unit1').val(optionsData.get('emissionDisplayUnit'));
                    $('#emission-unit2').val(optionsData.get('fuelConsumption')['unit2']);
                    break;                            
        }
    }
}

function toggleInputSource(){
  if($(this).prop('id')==="by-fuel-consumption"){
    if($(this).prop('checked')){
      $('#direct-co-emission').prop('checked',false);
      $('.by-fuel input,.by-fuel select').prop('disabled',false);
      $('.by-co input,.by-co select').prop('disabled',true);
    }
    else{
      $(this).prop('checked',true);
    }
  }
  if($(this).prop('id')==="direct-co-emission"){
    if($(this).prop('checked')){
      $('#by-fuel-consumption').prop('checked',false);
      $('.by-fuel input,.by-fuel select').prop('disabled',true);
      $('.by-co input,.by-co select').prop('disabled',false);
    }
    else{
      $(this).prop('checked',true);
    }
  }
}

function toggleInputType(){
  if($(this).prop('id')==="fuel-efficiency"){
    if($(this).prop('checked')){
      $('#fuel-value').val(1).prop('disabled',true);
      $('#distance-value').prop('disabled',false);
      $('#fuel-consumed-per').prop('checked',false);
      $('#custom-values').prop('checked',false);
      $('#usage-message').html(chrome.i18n.getMessage("feMessage"));
    }
    else{
      $('#fuel-value').prop('disabled',false);
    }
  }
  else if($(this).prop('id')==="fuel-consumed-per"){
    if($(this).prop('checked')){
      $('#distance-value').val(100).prop('disabled',true);
      $('#fuel-value').prop('disabled',false);
      $('#fuel-efficiency').prop('checked',false);
      $('#custom-values').prop('checked',false);
      $('#usage-message').html(chrome.i18n.getMessage("fcpMessage"));
    }
    else{
      $('#distance-value').prop('disabled',false);
    }
  }
  else{
    if($(this).prop('checked')){
      $('#distance-value').prop('disabled',false);
      $('#fuel-value').prop('disabled',false);
      $('#fuel-consumed-per').prop('checked',false);
      $('#fuel-efficiency').prop('checked',false);
      $('#usage-message').html(chrome.i18n.getMessage("cvMessage"));
    }
    else{
      $('#distance-value').prop('disabled',false);
    }
  }
}

function toggleTravelCost(){
  if($(this).prop('checked')){
    $('#fuel-cost,#fuel-cost-units,#currency-codes').prop('disabled',false);
  }
  else{
    $('#fuel-cost,#fuel-cost-units,#currency-codes').prop('disabled',true);
  }
}

$(document).bind('DOMContentLoaded', function () {
  optionsData = new StorageManager('calculationObject', function() {
    
    //assigning click listener to the save for each tabs
    document.getElementById('save-button').addEventListener('click', saveOptions);
    
    //assigning click listener to the tabs
    $('.tab-button').on('click',switchtab);

		$('#by-fuel-consumption,#direct-co-emission').on('click',toggleInputSource);

    $('#fuel-efficiency,#fuel-consumed-per,#custom-values').on('click',toggleInputType);

    $('#display-travel-cost').on('click',toggleTravelCost);
    /**
     * Prevents adding Hyphen(-) in the input field.
     */
    $('#consumption,#emission,#efficiency').bind('keypress',function(evtmin){
      if(evtmin.which === 45){
        evtmin.preventDefault();
      }
    });

    for(var i=0;i<currencyCodes.length;i++) {
      $('#currency-codes')
        .append($('<option></option>')
                .html(currencyCodes[i])
                .val(i)
               )
    }
    
    // Added multiple language support. replaces text with user language
    for(var i=0;i< $('[data-language]').length;++i) {
      $($('[data-language]')[i]).html(chrome.i18n.getMessage($($('[data-language]')[i]).data('language')))
    }
    
    loadOldData();
  });
/*
  $(document).on('data-attribute-changed', function() {
    var data = $('#contains-data').data('mydata');
    alert('Data changed to: ' + data);
  });*/

});

googleAnalytics('UA-1471148-11');
