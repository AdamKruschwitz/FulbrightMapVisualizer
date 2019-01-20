//import * as d3 from "../libs/d3";
const turnSpeed = 90;

var slider = document.getElementById("timeSlider"),
    range = document.getElementById("rangeNumber");

let m0,
    o0x,
    o0z,
    output1 = document.getElementById("demoSlider"),
    output2 = document.getElementById("demoRange");

function initUI() {
    let myWindow = d3.select(canvas)
        .on("mousedown", mousedown)
        .on("mousemove", mousemove)
        .on("mouseup", mouseup);

    output1.innerHTML = slider.value;
    output2.innerHTML = range.value;

    slider.oninput = function() {
        output1.innerHTML = this.value;
        arrowsUpdate();
    };

    range.oninput = function() {
        output2.innerHTML = this.value;
        arrowsUpdate();
    };
}

// Sets variables for globe control
function mousedown() {
    m0 = [d3.event.pageX, d3.event.pageY];
    o0z = pivot.rotation.z;
    o0x = pivot.rotation.x;
}


// Modifies pivot angle based on mouse movement
function mousemove() {
    if(m0) {
        let m1 = [d3.event.pageX, d3.event.pageY],
            o1z = o0z - (m0[0] -  m1[0]) / turnSpeed,
            o1x = o0x - (m0[1] - m1[1]) / turnSpeed;
        pivot.rotation.z = o1z;
        pivot.rotation.x = o1x;
        //renderer.render(scene, camera);
    }
}

function mouseup() {
    if(m0) {
        mousemove();
        m0 = null;
    }
}
