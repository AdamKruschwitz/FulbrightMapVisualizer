function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function randIntBetween(min, max) {
    return Math.floor(randomBetween(min, max));
}

// Unused
/*
Finds the cartesian products of a plane with a given point and normal vector
*/
function findPlaneFromPointAndNormalVector(point, normalVector) {
    let x = normalVector.x * point.x;
    let y = normalVector.y * point.y;
    let z = normalVector.z * point.z;
    return new THREE.Vector4(x, y, z, -1*(x+y+z));
}

// Unused
/*
Finds a point on a line from 2 intersecting planes. Untested, probably busted, who knows.
*/
function findPointOnLineFromIntersectingPlanes(plane1, plane2, arbitraryValue) {
    let z = arbitraryValue;
    let y = (plane2.x * plane1.z * z + plane2.x * plane1.w - plane1.x * plane2.z * z - plane1.x * plane2.w) / (plane1.x * plane2.y + plane2.x * plane1.y);
    let x = (plane1.y * y + plane1.z * z + plane1.w) / plane1.x;
    return new THREE.Vector3(x, y, z);
}

/*
Given the start point, an end point, and the axis of rotation, find the radius of a circle normal to that axis, which
crosses through point1, who's radius is such that point2 lies on the edge of the circle.
*/
function findRadiusFromTwoPointsAndAxisOfRotation(point1, point2, axisOfRotation) {
    // let radius = point2.clone().sub(point1);
    // let subRadius = axisOfRotation.clone();
    // subRadius.multiplyScalar(radius.dot(axisOfRotation));
    // radius.sub(subRadius);
    // return radius;
    let a = point2.clone().sub(point1);
    //console.log(a);
    let R = axisOfRotation.clone();
    //console.log(R);
    let aDotR = a.dot(R);
    //console.log(a);
    //console.log(aDotR);
    let RTimesADotR = R.clone().multiplyScalar(aDotR);
    //console.log(RTimesADotR);
    let radius = a.clone();
    //console.log(radius);
    radius.sub(RTimesADotR);
    //console.log(radius);
    return radius;
}

/*
    DEBUG: makes a cube at a given location.
     */
function makeCubeAt(point) {
    let geometry = new THREE.BoxGeometry( 1, 1, 1 );
    let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    let cube = new THREE.Mesh( geometry, material );
    pivot.add( cube );
    cube.position.x = point.x;
    cube.position.y = point.y;
    cube.position.z = point.z;
    cube.scale.set(20, 20, 20);
}


/*
DEBUG:  draws a line from a given start to a given end point.
 */
function drawLine(start, end) {
    let material = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });
    let geometry = new THREE.Geometry();
    geometry.vertices.push(
        start,
        end
    );
    let line = new THREE.Line( geometry, material );
    pivot.add( line );
}

//Averages 2 vectors
function averageVectors(v1, v2) {
    return new THREE.Vector3((v1.x+v2.x)/2, (v1.y+v2.y)/2, (v1.z+v2.z)/2);
}