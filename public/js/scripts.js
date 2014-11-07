
serverAddress = 'https://farasalamat.ir:8080';

loginAddress = serverAddress + '/auth/vault';
usersAddress = serverAddress + '/auth/users';
prescriptionsAddress = serverAddress + '/farasalamat/prescriptions';

server = {

login : function (username, password, callback) {
    var request = new XMLHttpRequest();
    request.open('POST', loginAddress, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 201) {
                callback(request.responseText);
            } else {
                alert('نام کاربری یا کلمه‌ی عبور وارد شده درست نیست.');
            }
        }
    };
    var payload = JSON.stringify({'username':username, 'password':password});
    request.send(payload);
},

getPatientInfo : function (patientId, callback) {
                        var patient = mockupPatients[patientId];
                        callback(patient);
                    },

getPrescriptionHistory : function(callback) {
    var request = new XMLHttpRequest();
    request.open('GET', prescriptionsAddress + '/' + patientId, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            callback(request.responseText);
        }
    };
    request.send();
},

sendPrescription : function(prescription, callback) {
    var request = new XMLHttpRequest();
    request.open('POST', prescriptionsAddress, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 201) {
            callback(request.responseText);
        }
    };
    var payload = JSON.stringify(prescription);
    request.send(payload);
},

getUser : function(userId, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', usersAddress + '/' + userId, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 201) {
            callback(request.responseText);
        }
    };
    request.send();
},

};

/**
 * A list of incomplete prescriptions. One prescription per unique patientId.
 * This list is created so that if a new search for a patient is performed as a
 * prescription for another patient is being written, the prescription is not
 * lost. Once a prescription is submitted, no longer will remain in this list.
 */
newPrescriptions = {

};

/**
 * The new prescription being written.
 */
newPrescription = {
    patientId : 0,      // The unique patientId
    items : {},         // List of prescribed items.
    itemsList : [],     //
    itemsCreated : 0,   // The total number of items created including those deleted
    status : 'none'     // The state of the prescription.
};

daroo = undefined;
patientId = undefined;  // The unique id of the patient.
physicianId = undefined;  // The unique id of the patient.
pharmacistId = undefined;  // The unique id of the patient.
userRole = undefined;  // The unique id of the patient.



function aboutUs() {

}

function contactUs() {

}

function questions() {

}

function passwordInputPressed(e) {
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13') {
        login();
        return false;
    }
}

function login() {
    var element = document.getElementById('username');
    var username = element.value;
    var reg = /^\d+$/;
    if (!reg.test(username)) {
        alert('نام کاربری شما همان شماره نظام پزشکی‌ شما است که تنها از اعداد تشکیل می‌‌شود.');
        return;
    }

    element = document.getElementById('password');
    var password = element.value;
    server.login(username, password, successLogin);
}

function successLogin(result) {
    //Store the cookie from the response.
    var response = JSON.parse(result);
    if (response.qualification === 'physician') {
        physicianId = response.nationalId;
        pharmacistId = null;
        userRole = 'physician';
    } else if (response.qualification === 'pharmacist') {
        physicianId = null;
        pharmacistId = response.nationalId;
        userRole = 'pharmacist';
    }
    populateUserInfo(response);
}

function patientSearchInputPressed(e) {
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13') {
        getPatientInfo();
        return false;
    }
}

function getUserInfo(entry, summary) {
    var user = entry.physicianId;
    var date = moment(entry.created_at, 'YYYY-M-D HH:mm:ss').format('jYYYY-jM-jD');
    var totalItems = englishToPersian(' ' + entry.items.length) + '&nbsp;&nbsp;' + 'قلم';
    var status = entry.status;

    server.getUser(user, function (response) {
    var physician = JSON.parse(response);
    var str = space + englishToPersian(date) + space + totalItems;

    var summaryContent = document.createElement('div');
    summaryContent.className = 'historyprescriptionsummarycontent';
    summaryContent.innerHTML = str + space + 'دکتر' + '&nbsp;&nbsp;' + physician.firstname + '&nbsp;&nbsp;' + physician.lastname;
    summary.appendChild(summaryContent);

    var statusIcon = document.createElement('div');
    statusIcon.className = 'historyprescriptionstatusicon';
    if (status === 'new') {
        statusIcon.className += ' prescriptionnewicon';
    } else if (status === 'filled') {
        statusIcon.className += ' prescriptionfilledicon';
    } else if (status === 'partiallyfilled') {
        statusIcon.className += ' prescriptionpartiallyfilledicon';
    }
    summary.appendChild(statusIcon);


    });
}

function getPatientInfo() {
    var patientId = document.getElementById('patientsearch').value.trim();
    var reg = /^\d+$/;
    if ( !reg.test(patientId) ) {
        patientId = persianToEnglish(patientId);
        if ( !reg.test(patientId) ) {
            alert('کد ملی‌ یا شناسه بیمه بیمار فقط شامل اعداد می‌باشد.');
            return;
        }
    }

    /*
     * Make a call to the server and fetch patients info. The callback function
     * should display the info.
     */
    server.getPatientInfo(patientId, showPatientInfo);
}

function showPatientInfo(patient) {

    if (patientId === patient.mellicode) {
        // This is a redundant search for the current patient.
        return;
    }
    
    if (newPrescriptions[patientId]) {
        /**
         * There is already a prescription for this patient in memory.
         */
        //TODO: Implement This method.
        //populatePrescription(newPrescriptions.patientId)
        //return;
    }

    patientId = patient.mellicode;  // Set the current patient.
    resetPrescription();
    var element = document.getElementById('patient');
    if (patient) {
        var notFoundDiv = document.getElementById('patientnotfound');
        notFoundDiv.style.display = 'none';

        populatePatientInfo(patient);
        element.style.display = 'block';
        var prescriptionButtons = document.getElementById('prescriptionbuttons');
        if (userRole === 'physician') {
            prescriptionButtons.style.display = 'block';
        } else if (userRole === 'pharmacist') {
            prescriptionButtons.style.display = 'none';
            document.getElementById('prescriptions').style.top = '150px';
            prescriptionHistory();
        }
    } else {
        element.style.display = 'none';
        element = document.getElementById('patientnotfound');
        element.innerHTML = 'فردی با کد ملی‌ و یا شماره بیمه ' + englishToPersian(patientId) + ' یافت نشد';
        element.style.display = 'block';
    }
}

function createNewPrescription() {
    var element = document.getElementById('prescriptionhistory');
    element.style.display = 'none';
    element = document.getElementById('newprescription');
    element.style.display = 'block';
    element = document.getElementById('prescriptiontitles');
    element.style.display = 'block';

    /**
     * Create a new prescription for the current patient and add it
     * to the list of incomplete prescriptions.
     */
    createPrescription();
    newPrescriptions[patientId] = newPrescription;
}

function createPrescription() {
    if (newPrescription.status === 'none') {
        if (daroo === undefined) {
            readTextFile('data/darooList.txt');
        }
        addPrescriptionItem();
    }
}

function resetPrescription() {
    newPrescription = { 'patientId' : patientId, 'items' : {}, 'itemsList' : [], 'itemsCreated' : 0, 'status' : 'none' };

    var element = document.getElementById('prescriptiontitles');
    element.style.display = 'none';

    element = document.getElementById('prescriptionhistory');
    clearElement(element);

    element = document.getElementById('newprescription');
    element.style.display = 'none';
    element = document.getElementById('newprescriptionitems');
    clearElement(element);
}

function addPrescriptionItem() {
    createPrescriptionItem();
    var totalItems = Object.keys(newPrescription.items).length;

    var element = document.getElementById('newprescriptionitems');
    element.style.height = totalItems * 65 + 'px';

    element = document.getElementById('newprescriptioncontrols');
    element.style.top = 23 + totalItems * 65 + 'px';

    element = document.getElementById('newprescription');
    element.scrollTop = element.scrollHeight;
}

function cancelPrescription() {
    resetPrescription();
    delete newPrescriptions[patientId];
}

function sendPrescription() {
    console.log('sendPrescription was called...' + newPrescription);
    var prescription = buildPrescription();
    if (prescription != null) {
      server.sendPrescription(buildPrescription(), prescriptionReceipt);
    } else {
        alert('Incomplete prescription item found.');
    }
}

function buildPrescription() {
    var prescription = {};
    prescription.patientId = newPrescription.patientId;
    prescription.physicianId = physicianId;
    prescription.status = 'new';
    var itemsList = newPrescription.itemsList;
    var items = [];
    var item = {};
    for (var i = 0; i < itemsList.length ; i++) {
        drugItem = itemsList[i];
        var itemNumber = getItemNumber(drugItem);
        item = {};
        // Get the drug name
        item.drugname = getDrugName(itemNumber);
        item.shape = getDrugShape(itemNumber);
        item.strength = getDrugStrength(itemNumber);
        item.durationValue = getDrugDurationValue(itemNumber);
        item.duration = getDrugDuration(itemNumber);
        item.intervalValue = getDrugIntervalValue(itemNumber);
        item.interval = getDrugInterval(itemNumber);
        item.dosage = getDrugDosage(itemNumber);
        item.route = getDrugRoute(itemNumber);
        item.note = getDrugNote(itemNumber);
        item.status = 'new';
        if (validatePresscriptionItem(item)) {
            items.push(item);
        } else {
            return null;
        }
    }
    prescription.items = items;
    return prescription;
}

function validatePresscriptionItem(item) {
    for (key in item) {
        if (item[key] === null) {
            return false;
        }
    }
    return true;
}

function getItemNumber(drugItem) {
    var items = newPrescription.items;
    for (key in items) {
        if (items[key].view === drugItem) {
            return items[key].itemNumber;
        }
    }
    return -1;
}

function getDrugName(itemNumber) {
    var element = document.getElementById(patientId + 'drugname' + itemNumber);
    var value = element.value;
    return (value == '' ) ? null : value;
}

function getDrugShape(itemNumber) {
    var element = document.getElementById(patientId + 'drugshape' + itemNumber);
    var value = element.options[element.selectedIndex].text;
    return (value == DRUG_SHAPE_SELECTOR_TEXT ) ? null : value;
}

function getDrugStrength(itemNumber) {
    var element = document.getElementById(patientId + 'drugstrength' + itemNumber);
    var value = element.options[element.selectedIndex].text;
    return (value == DRUG_STRENGTH_SELECTOR_TEXT ) ? null : value;
}

function getDrugDurationValue(itemNumber) {
    var element = document.getElementById(patientId + 'drugdurationvalue' + itemNumber);
    var value = element.value;
    return (value == '' ) ? null : value;
}

function getDrugDuration(itemNumber) {
    var element = document.getElementById(patientId + 'drugduration' + itemNumber);
    var value = element.options[element.selectedIndex].text;
    return (value == DRUG_DURATION_SELECTOR_TEXT ) ? null : value;
}

function getDrugIntervalValue(itemNumber) {
    var element = document.getElementById(patientId + 'drugintervalvalue' + itemNumber);
    var value = element.value;
    return (value == '' ) ? null : value;
}

function getDrugInterval(itemNumber) {
    var element = document.getElementById(patientId + 'druginterval' + itemNumber);
    var value = element.options[element.selectedIndex].text;
    return (value == DRUG_INTERVAL_SELECTOR_TEXT ) ? null : value;

}

function getDrugDosage(itemNumber) {
    var element = document.getElementById(patientId + 'drugdosage' + itemNumber);
    var value = element.value;
    return (value == '' ) ? null : value;
}

function getDrugRoute(itemNumber) {
    var element = document.getElementById(patientId + 'drugroute' + itemNumber);
    var value = element.options[element.selectedIndex].text;
    return value;
    //return (value == DRUG_ROUTE_SELECTOR_TEXT ) ? null : value;
}

function getDrugNote(itemNumber) {
    var element = document.getElementById(patientId + 'drugnote' + itemNumber);
    return element.value;
}

function prescriptionReceipt(response) {
    var pin = JSON.parse(response).pin
    alert(PIN_DIALOGUE + pin);
    resetPrescription();
    delete newPrescriptions[patientId];
}

/**
 * create the ui for the new prescription item.
 */
function createPrescriptionItem() {
    var prescriptionItems = document.getElementById('newprescriptionitems');
    var itemNumber = newPrescription.itemsCreated;
    newPrescription.itemsCreated = newPrescription.itemsCreated + 1;
    var totalNumbers = Object.keys(newPrescription.items).length;

    var prescriptionItem = document.createElement('div');
    prescriptionItem.className = 'prescriptionitem';
    prescriptionItem.id = patientId + 'prescriptionitem' + itemNumber;
    prescriptionItem.style.top = totalNumbers * 65 + 'px';
    prescriptionItem.style.backgroundColor = (totalNumbers % 2 == 1) ? '#c2c2c2' : '#e2e2e2';

    prescriptionItems.appendChild(prescriptionItem);

    var element = document.createElement('input');
    element.type = 'text';
    element.className = 'drugnameinput';
    var drugNameId = 'drugname' + itemNumber;
    element.id = patientId + drugNameId;
    element.placeholder = 'Type drug name in Latin';
    element.autocomplete = 'off';
    element.autocomplete = 'off';
    element.onkeyup = function(e) {
                            drugNameInputPressed(e, itemNumber);
                        };
    element.onblur = function(e) {
                            drugNameInputBlurred(e);
                        };
    prescriptionItem.appendChild(element);

    element = document.createElement('select');
    element.id = patientId + 'drugshape' + itemNumber;
    element.className = 'drugshapeselect';
    prescriptionItem.appendChild(element);
    element.onchange = function(e) {
                            filterCandidates('shape', itemNumber);
                        };
    var option = document.createElement('option');
    option.text = 'Shape';
    element.add(option);
    element.selectedIndex = 0;

    element = document.createElement('select');
    element.id = patientId + 'drugstrength' + itemNumber;
    element.className = 'drugstrengthselect';
    prescriptionItem.appendChild(element);
    element.onchange = function(e) {
                            filterCandidates('strength', itemNumber);
                            //console.log('was selected');
                        };
    option = document.createElement('option');
    option.text = 'Strength';
    element.add(option);
    element.selectedIndex = 0;
    
    element = document.createElement('input');
    element.id = patientId + 'drugnote' + itemNumber;
    element.className = 'drugnoteinput';
    element.placeholder = 'یاد داشت';
    prescriptionItem.appendChild(element);

    element = document.createElement('select');
    element.id = patientId + 'drugroute' + itemNumber;
    element.className = 'drugrouteselect';
    prescriptionItem.appendChild(element);
    element.onchange = function(e) {
        //console.log('was selected');
    };

    option = document.createElement('option');
    option.text = 'روش مصرف';
    element.add(option);
    element.selectedIndex = 0;

    element = document.createElement('input');
    element.type = 'number';
    element.id = patientId + 'drugdosage' + itemNumber;
    element.className = 'drugdosageinput';
    element.min = 0;
    prescriptionItem.appendChild(element);

    element = document.createElement('select');
    element.id = patientId + 'druginterval' + itemNumber;
    element.className = 'drugintervalselect';
    prescriptionItem.appendChild(element);
    element.onchange = function(e) {
                            //console.log('was selected');
                        };
    option = document.createElement('option');
    option.text = 'دوره';
    element.add(option);
    option = document.createElement('option');
    option.text = 'دقیقه';
    element.add(option);
    option = document.createElement('option');
    option.text = 'ساعت';
    element.add(option);
    option = document.createElement('option');
    option.text = 'روز';
    element.add(option);
    option = document.createElement('option');
    option.text = 'هفته';
    element.add(option);
    option = document.createElement('option');
    option.text = 'ماه';
    element.add(option);
    element.selectedIndex = 0;

    element = document.createElement('input');
    element.type = 'number';
    element.id = patientId + 'drugintervalvalue' + itemNumber;
    element.className = 'drugintervalvalueinput';
    element.min = 1;
    prescriptionItem.appendChild(element);
    element.onchange = function(e) {
                            //console.log('was selected');
                        };

    element = document.createElement('div');
    element.className = 'drugintervalprefix';
    element.innerHTML = 'هر';
    prescriptionItem.appendChild(element);
    
    element = document.createElement('select');
    element.id = patientId + 'drugduration' + itemNumber;
    element.className = 'drugdurationselect';
    prescriptionItem.appendChild(element);
    

    option = document.createElement('option');
    option.text = 'مدت';
    element.add(option);
    option = document.createElement('option');
    option.text = 'روز';
    element.add(option);
    option = document.createElement('option');
    option.text = 'هفته';
    element.add(option);
    option = document.createElement('option');
    option.text = 'ماه';
    element.add(option);
    element.selectedIndex = 0;
    
    element = document.createElement('input');
    element.type = 'number';
    element.id = patientId + 'drugdurationvalue' + itemNumber;
    element.className = 'drugdurationvalueinput';
    element.min = 1;
    prescriptionItem.appendChild(element);

    element = document.createElement('div');
    element.className = 'drugdurationprefix';
    element.innerHTML = 'برای';
    prescriptionItem.appendChild(element);

    element = document.createElement('div');
    element.className = 'removeicon';
    element.onclick = function(e) {
        removePrescriptionItem(itemNumber);
    };
    prescriptionItem.appendChild(element);
    

    var tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerHTML = 'حذف این قلم دارو';
    element.appendChild(tooltip);

    newPrescription.items[itemNumber] = {'view' : prescriptionItem, 'itemNumber' : itemNumber};
    newPrescription.itemsList.push(prescriptionItem);
    
    newPrescription.status = 'edit';
}

function removePrescriptionItem(itemNumber) {
    var index = newPrescription.itemsList.indexOf(newPrescription.items[itemNumber].view);
    newPrescription.itemsList.splice(index, 1);
    
    delete newPrescription.items[itemNumber]; // remove the model

    var prescriptionItems = document.getElementById('newprescriptionitems');
    var item = document.getElementById(patientId + 'prescriptionitem'+ itemNumber);
    //var offset = item.offsetHeight;
    prescriptionItems.removeChild(item);

    var totalItems = Object.keys(newPrescription.items).length;
    prescriptionItems.style.height = totalItems * 65 + 'px';
    
    var controls = document.getElementById('newprescriptioncontrols');
    controls.style.top = 23 + totalItems * 65 + 'px';

//    var keys = Object.keys(newPrescription.items);
//    var key;
//    for (var i = 0 ; i < keys.length ; i++) {
//        key = keys[i];
//        if(itemNumber < newPrescription.items[key]['itemNumber'] ) {
//            newPrescription.items[key].view.style.top = newPrescription.items[key].view.offsetTop - offset;
//        }
//    }
    var length = newPrescription.itemsList.length;
    var prescriptionItem;
    for (var i = 0 ; i < length ; i++) {
        prescriptionItem = newPrescription.itemsList[i];
        newPrescription.itemsList[i].style.top = i*65 + 'px';
        prescriptionItem.style.backgroundColor = (i % 2 === 1) ? '#c2c2c2' : '#e2e2e2';
    }
}

function prescriptionHistory() {
    var element = document.getElementById('newprescription');
    element.style.display = 'none';
    element = document.getElementById('prescriptiontitles');
    element.style.display = 'none';
    element = document.getElementById('prescriptionhistory');
    element.style.display = 'block';

    server.getPrescriptionHistory(showPrescriptionHistory);
}

function showPrescriptionHistory(history) {
    var prescriptions = sortByDateCreated(JSON.parse(history));

    element = document.getElementById('prescriptionhistory');
    clearElement(element);

    var total = prescriptions.length;

    moment.loadPersian();

    for (var i = total-1 ; 0 <= i  ; i--) {
        var entry = prescriptions[i];
        var details = document.createElement('div');
        details.className = 'historyPrescriptiondetails';
        details.id = 'historyPrescriptiondetails' + i;
        details.style.backgroundColor = (i % 2 == 1) ? '#c2c2c2' : '#e2e2e2';

        var summary = document.createElement('div');
        summary.className = 'historyPrescriptionsummary';
        setSummaryOnClick(summary, i);
        details.appendChild(summary);

        getUserInfo(entry, summary);

        for (var j = 0 ; j < entry.items.length ; j++) {
            var item = document.createElement('div');
            item.className = 'historyprescriptionitem';
            item.appendChild(getItemInfo(entry.items[j]));
            item.appendChild(getItemOrder(entry.items[j]));
            item.style.backgroundColor = (j % 2 == 1) ? '#E3ECFA' : '#CFD7E6';

            if (userRole === 'pharmacist') {
                addPharmacyControls(item, i, j, entry);
            } else if (userRole === 'physician') {
                var icon = document.createElement('div');
                icon.className = 'prescriptionitemstatusicon';
                setItemStatusIconImage(icon, entry.items[j]);
                item.appendChild(icon);
            }
            details.appendChild(item);
        }

        element.appendChild(details);
    }
}

function addPharmacyControls(item, i, j, entry) {
    var status = entry.items[j].status;
    if (status != 'fillled') {
        var control = document.createElement('input');
        control.className = 'prescriptionitemcontrol prescriptionitemcontrolfilled';

        control.setAttribute('type', 'radio');
        control.setAttribute('id', 'radiostatus' + i + 'filled'+ j);
        control.setAttribute('name', 'radiostatus' + i + '_'+ j);

        var labelFilled = document.createElement('lable');
        labelFilled.className = 'prescriptionitemcontrollabel prescriptionitemcontrollabelfilled';
        var textFilled = document.createTextNode('تحویل کامل');
        labelFilled.appendChild(textFilled);

        item.appendChild(labelFilled);
        item.appendChild(control);
        
        control = document.createElement('input');
        control.className = 'prescriptionitemcontrol prescriptionitemcontrolpartiallyfilled';

        control.setAttribute('type', 'radio');
        control.setAttribute('id', 'radiostatus' + i + 'partiallyfilled'+ j);
        control.setAttribute('name', 'radiostatus' + i + '_'+ j);

        var labelPartiallyFilled = document.createElement('lable');
        labelPartiallyFilled.className = 'prescriptionitemcontrollabel prescriptionitemcontrollabelpartiallyfilled';
        var textPartiallyFilled = document.createTextNode('تحویل جزئی');
        labelPartiallyFilled.appendChild(textPartiallyFilled);

        item.appendChild(labelPartiallyFilled);
        item.appendChild(control);
    } else {
        var icon = document.createElement('div');
        icon.className = 'prescriptionitemstatusicon';
        setItemStatusIconImage(icon, entry.items[j]);
        item.appendChild(icon);
    }
}

function setSummaryOnClick(summary, i) {
    summary.onclick = function(e) {
        var element = document.getElementById('historyPrescriptiondetails' + i);
        for (var j = 0; j < element.childNodes.length; j++) {
            var child = element.childNodes[j];
            var display = child.style.display;
            if (display === '') {
                child.style.display = 'block';
            } else {
                if (child.className != 'historyPrescriptionsummary') {
                    child.style.display = '';
                }
            }
        }
    };
}

function showUserInfo(response) {
    console.log(response);
}

function setItemStatusIconImage(icon, item) {
    var status = item.status;
    if (status === 'new') {
        icon.className += ' prescriptionitemnewicon';
    } else if (status === 'partiallyfilled') {
        icon.className += ' prescriptionitempartiallyfilledicon';
    } else if (status === 'filled') {
        icon.className += ' prescriptionitemfilledicon';
    } else {
        icon.className += ' prescriptionitemnewicon';
    }
}

function getItemInfo(item) {
    var itemInfo = document.createElement('div');
    itemInfo.className = 'historyprescriptioniteminfo';
    itemInfo.innerHTML = item.drugname + space + item.shape + space + item.strength;
    return itemInfo;
}

function getItemOrder(item) {
    var itemInfo = document.createElement('div');
    itemInfo.className = 'historyprescriptionitemorder';
    itemInfo.innerHTML = ' برای ' + englishToPersian(item.durationValue) + ' ' + item.duration  + ' هر ' + englishToPersian(item.intervalValue) + ' ' + item.interval + ' ' + englishToPersian(item.dosage)  + ' ' + item.route;
    return itemInfo;
}

//TODO: impelment this method.
function sortByDateCreated(history) {
    return history;
}

function populatePatientInfo(patient) {
    var element = document.getElementById('patientfirstname');
    element.innerHTML = patient['firstname'];
    element = document.getElementById('patientlastname');
    element.innerHTML = patient['lastname'];
    element = document.getElementById('patientmellicode');
    element.innerHTML = englishToPersian(patient['mellicode']);
    element = document.getElementById('patientgender');
    element.innerHTML = patient['gender'];
    element = document.getElementById('patientage');
    element.innerHTML = englishToPersian(patient['age']);
    element = document.getElementById('patientspecial');
    element.innerHTML = patient['special'];
    element = document.getElementById('insurancenumber');
    element.innerHTML = englishToPersian(patient['insnumber']);
    element = document.getElementById('insurancecompany');
    element.innerHTML = patient['inscompany'];
    element = document.getElementById('insuranceexpdate');
    element.innerHTML = patient['expdate'];
}

function populateUserInfo(response) {
    /*
     *  pull account info and populate the client div.
     */
    var element = document.getElementById('logindiv');
    element.style.display = 'none';

    element = document.getElementById('physicians');
    element.style.display = 'block';

    element = document.getElementById('physicianinfolabeltitle');
    if (response.qualification === 'physician') {
        element.innerHTML = 'مشخصات پزشک';
    } else if (response.qualification === 'pharmacist') {
        element.innerHTML = 'مشخصات دارو ساز';
    }

    element = document.getElementById('physicianfirstname');
    element.innerHTML = response.firstname;

    element = document.getElementById('physicianlastname');
    element.innerHTML = response.lastname;

    element = document.getElementById('nezampezeshki');
    element.innerHTML = englishToPersian(response.licenceId);

}

function forgotPassword() {
    alert('چنانچه کلمه‌ی عبور خود را فراموش نموده اید، از طریق ایمیل با ما تماس بگیرید.');
}

function englishToPersian(str) {
    var persian = "";
    var char;
    for (var i=0; i < str.length; i++) {
        char = str.charAt(i);
        switch(char) {
            case "0":
                persian = persian + "۰";
                break;
            case "1":
                persian = persian + "۱";
                break;
            case "2":
                persian = persian + "۲";
                break;
            case "3":
                persian = persian + "۳";
                break;
            case "4":
                persian = persian + "۴";
                break;
            case "5":
                persian = persian + "۵";
                break;
            case "6":
                persian = persian + "۶";
                break;
            case "7":
                persian = persian + "۷";
                break;
            case "8":
                persian = persian + "۸";
                break;
            case "9":
                persian = persian + "۹";
                break;
            default:
                persian = persian + char;
        }
    }
    return persian;
}

function persianToEnglish(str) {
    var english = "";
    var char;
    for (var i=0; i < str.length; i++) {
        char = str.charAt(i);
        switch(char) {
            case "۰":
                english = english + "0";
                break;
            case "۱":
                english = english + "1";
                break;
            case "۲":
                english = english + "2";
                break;
            case "۳":
                english = english + "3";
                break;
            case "۴":
                english = english + "4";
                break;
            case "۵":
                english = english + "5";
                break;
            case "۶":
                english = english + "6";
                break;
            case "۷":
                english = english + "7";
                break;
            case "۸":
                english = english + "8";
                break;
            case "۹":
                english = english + "9";
                break;
            default :
                english = english + char;
        }
    }
    return english;
}

function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
                if(rawFile.readyState === 4) {
                    if(rawFile.status === 200 || rawFile.status == 0) {
                        var allText = rawFile.responseText;
                        var mydata = allText.split('\r');
                        var record;
                        var index;
                        var drugName;
                        daroo = {};
                        for (var i = 0 ; i < mydata.length ; i++ ) {
                            record = mydata[i].split('\t');
                            drugName = record[2];
                            index = drugName.substring(0,3).toUpperCase();
                            //console.log(index);
                            if (!daroo.hasOwnProperty(index)) {
                                daroo[index] = [];
                            }
                            daroo[index].push(record);
                        }
                    }
                }
        };
    rawFile.send(null);
}

function drugNameInputPressed(e, itemNumber) {
    var drugNameInput = document.getElementById(patientId + 'drugname' + itemNumber);
    var partialName = drugNameInput.value.toUpperCase().trim();
    var hint = document.getElementById('drugnamehint');
    clearAndHide(hint);
    if (2 < partialName.length) {
        var all = daroo[partialName.substring(0,3)];
        if (all != undefined && all != null) {
            var candidates = {};
            var name;
            for (var i = 0 ; i < all.length ; i++) {
                name = all[i][2];
                if (partialName === name.substring(0,partialName.length).toUpperCase()) {
                    if (candidates[name] === undefined) {
                        candidates[name] = [];
                    }
                    candidates[name].push(all[i]);
                }
            }
            if ( 0 < Object.keys(candidates).length ) {
                populateDrugNameHint(candidates, itemNumber);
                hint.style.display = 'block';
            } else {
                clearAndHide(hint);
            }
        } else {
            clearAndHide(hint);
        }
    } else {
        clearAndHide(hint);
    }

    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13') {
        //console.log(element.value);
    }
}

function drugNameInputBlurred(e) {
    //var hint = document.getElementById('drugnamehint');
    //clearAndHide(hint);
}

function populateDrugNameHint(candidates, itemNumber) {
    var prescriptionItem = document.getElementById(patientId + 'prescriptionitem' + itemNumber);
    var drugNameInput = document.getElementById(patientId + 'drugname' + itemNumber);
    var offsetTop = prescriptionItem.offsetTop + drugNameInput.offsetTop;
    var offsetHeight = drugNameInput.offsetHeight;
    var hint = document.getElementById('drugnamehint');
    hint.style.top = offsetTop + offsetHeight + 'px';
//    console.log(itemNumber);
    var keys = Object.keys(candidates);
    hint.style.height = keys.length*20 + 'px';

    for (var i = 0 ; i < keys.length ; i++) {
        createDrugnameOptionCell(candidates, keys, i, itemNumber);
    }
}

function createDrugnameOptionCell(candidates, keys, index, itemNumber) {
    var hint = document.getElementById('drugnamehint');

    var option = document.createElement('label');
    option.style.top = index*20 + 'px';
    option.className = 'drugnameoption';
    option.innerHTML = keys[index];
    hint.appendChild(option);
    option.onclick = function(e) {
        var drugNameInput = document.getElementById(patientId + 'drugname' + itemNumber);
        var drugName = option.innerHTML;
        drugNameInput.value = drugName;
        setCandidates(candidates[drugName], itemNumber);
        clearAndHide(hint);
    };
}

function setCandidates(candidates, itemNumber) {
    newPrescription.items[itemNumber].candidates = candidates;

    var shapes = aggregateDrugInfo(candidates, 1);
    var element = document.getElementById(patientId + 'drugshape' + itemNumber);
    clearElement(element);
    if (1 < shapes.length) {
        var option = document.createElement('option');
        option.text = 'Shape';
        element.add(option);
    }

    for (var i = 0 ; i < shapes.length ; i++) {
        createDrugSelectionOptions('shape', shapes[i], itemNumber);
    }

    var strength = aggregateDrugInfo(candidates, 0);
    element = document.getElementById(patientId + 'drugstrength' + itemNumber);
    clearElement(element);
    if (1 < strength.length) {
        option = document.createElement('option');
        option.text = 'Strength';
        element.add(option);
    }

    for (var j = 0 ; j < strength.length ; j++) {
        createDrugSelectionOptions('strength', strength[j], itemNumber);
    }

    if (shapes.length === 1) {
        /**
         * The shape of the drug is determined at this point. Now set
         * the routes options.
         */
        element = document.getElementById(patientId + 'drugroute' + itemNumber);
        clearElement(element);
        var option = document.createElement('option');
        option.text = 'روش مصرف';
        element.add(option);
        var routes = ShapeRoute[shapes[0]];
            if(routes) {
            if (1 < routes.length) {
//                var option = document.createElement('option');
//                option.text = 'روش مصرف';
//                element.add(option);
            }
    
            for (var k = 0 ; k < routes.length ; k++) {
                createDrugSelectionOptions('route', routes[k], itemNumber);
            }
        }
    }
}

function aggregateDrugInfo(candidates, index) {
    var aggregated = [];
    for (var i = 0 ; i < candidates.length ; i++) {
        if (aggregated.indexOf(candidates[i][index]) === -1 ) {
            aggregated.push(candidates[i][index]);
        }
    }
    //console.log(aggregated);
    return aggregated;
}

function createDrugSelectionOptions(identifier, value, itemNumber) {
    var element = document.getElementById(patientId + 'drug' + identifier + itemNumber);
    var option = document.createElement('option');
    option.value = value;
    option.text = value;
    element.add(option);
}

function clearAndHide(div) {
    div.style.display = 'none';
    //div.innerHTML = '';
    clearElement(div);
}

function getSelectedOption(elementId) {
    var element = document.getElementById(patientId + elementId);

    if (element.selectedIndex == -1 || element.selectedIndex == 0) {
        return null;
    }
    return element.options[element.selectedIndex].text;
}

function filterCandidates(identifier, itemNumber) {
    if (getSelectedOption('drugshape' + itemNumber) !== null) {
        filter(1, itemNumber, getSelectedOption('drugshape' + itemNumber));
    }
    if (getSelectedOption('drugstrength' + itemNumber) !== null) {
        filter(0, itemNumber, getSelectedOption('drugstrength' + itemNumber));
    }

    //createDrugSelectionOptions;
    setCandidates(newPrescription.items[itemNumber].candidates, itemNumber);
}

function filter(criterium, itemNumber, selected) {
    var filteredCandidates = [];
    var candidates = newPrescription.items[itemNumber].candidates;
    var keys = Object.keys(candidates);
    
    for (var i = 0 ; i < keys.length ; i++) {
        if (candidates[i][criterium] === selected) {
            filteredCandidates.push(candidates[i]);
        }
    }
    newPrescription.items[itemNumber].candidates = filteredCandidates;
}

function clearElement(element) {
    while (element.hasChildNodes()) {
        element.removeChild(element.lastChild);
    }
}
var DRUG_SHAPE_SELECTOR_TEXT = 'Shape';
var DRUG_STRENGTH_SELECTOR_TEXT = 'Strength';
var DRUG_DURATION_SELECTOR_TEXT = 'مدت';
var DRUG_INTERVAL_SELECTOR_TEXT = 'دوره';
var DRUG_ROUTE_SELECTOR_TEXT = 'روش مصرف';
var PIN_DIALOGUE = 'این رمز نسخه را به بیمار بدهید: ';


//var ShapeUnit = {
//        'Tab' : 'عدد',
//        'Cap' : 'عدد',
//        'Inj' : 'تزریق',
//        'Sol': 'میلی‌ لیتر',
//        'Drop': 'قطره',
//        'Syrup': 'قاشق',
//        'Oint': 'بار'
//    };

var ShapeRoute = {
        'Tab' : ['عدد میل شود',
                 'عدد قبل از غذا میل شود',
                 'عدد همراه با غذا میل شود',
                 'عدد بعد از غذا میل شود'],
         'Scored Tab' : ['عدد میل شود',
                  'عدد قبل از غذا میل شود',
                  'عدد همراه با غذا میل شود',
                  'عدد بعد از غذا میل شود'],
        'Cap' : ['عدد میل شود',
                 'عدد قبل از غذا میل شود',
                 'عدد همراه با غذا میل شود',
                 'عدد بعد از غذا میل شود'],
        'Inj' : ['بار تزریق گردد'],
        'Sol':  ['میلی‌ لیتر استفاده شود'],
        'Drop': ['قطره میل شود',
                 'قطره در گوش چکیده شود',
                 'قطره در چشم چکیده شود'],
        'Syrup': ['قاشق میل شود',
                  'قاشق قبل از غذا میل شود',
                  'قاشق همراه با غذا میل شود',
                  'قاشق بعد از غذا میل شود'],
        'Oint': ['بار به موضع مالیده شود']
    };

var mockupPatients = {
    '1111' : {'firstname':'حسن', 'lastname':'احمدی‌', 'mellicode':'1111', 'insnumber':'11111111', 'inscompany':'خدمات درمانی ', 'expdate':'۱۳۹۷/۱۱/۰۵', 'special': 'هموفیلی', 'age':'35', 'gender':'مرد'},
    '2222' : {'firstname':'ساناز', 'lastname':'شجاعی', 'mellicode':'2222', 'insnumber':'22222222', 'inscompany':'سلامت', 'expdate':'۱۳۹۵/۰۳/۱۲', 'special': 'خیر', 'age':'11', 'gender':'زن'},
    '3333' : {'firstname':'سامان', 'lastname':'زاهد', 'mellicode':'3333', 'insnumber':'33333333', 'inscompany':'خدمات درمانی ', 'expdate':'۱۳۹۸/۰۸/۰۸', 'special': 'خیر', 'age':'5', 'gender':'مرد'},
    '4444' : {'firstname':'فاطمه', 'lastname':'محمدی', 'mellicode':'4444', 'insnumber':'44444444', 'inscompany':'تامین اجتماعی', 'expdate':'۱۳۹۵/۱۰/۲۳', 'special': 'خیر', 'age':'56', 'gender':'زن'},
    '5555' : {'firstname':'قدرت', 'lastname':'جواهریان', 'mellicode':'5555', 'insnumber':'55555555', 'inscompany':'دانا', 'expdate':'۱۳۹۷/۰۳/۱۷', 'special': 'خیر', 'age':'76', 'gender':'مرد'}
};

var space = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
