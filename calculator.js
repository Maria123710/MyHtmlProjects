const display = document.getElementById("display");

function appendToDisplay(input){
    display.value += input;
}

function calculate(){
    try{display.value = eval(display.value);
    }
    catch(err){
        display.value = 'Error';
    }
}
function Clear(){
    display.value = '';
}
function decrease(){
    display.value = display.value.slice(0, -1);
}

