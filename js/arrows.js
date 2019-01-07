// Creates an arrow at the given [Longitude, Latitude]
//import * as THREE from "../libs/three";

const arrowLength = 8,                      // Length of arrows (in units?)
    arrowHeight = 2.0648,                   // Height of arrows (in units?)
    maxHeightAboveGlobe = 80,               // Max height above the ground (in units?)
    origin = new THREE.Vector3(0, 0, 0);    // A vector at the origin for math

var arrows = [],                            // An array to store all arrows
    arrowsSize = 0;                         // the size of the arrows array

function makeArrow(startPoint, endPoint, group) {

    // load a resource
    ObjLoader.load(
        // resource URL
        'data/Arrow.obj',
        // called when resource is loaded
        function ( object ) {

            // Convert longitude and latitude to a vector3
            let startVector3 = vertex(startPoint);
            let endVector3 = vertex(endPoint);

            //DEBUG: set random time values
            object.year = randIntBetween(1997, 2019);
            object.start = startVector3;
            object.end = endVector3;

            // Set the arrow at the starting location.
            object.position.set(startVector3.x, startVector3.y, startVector3.z);

            // Determine the scale values of the arrow
            let zScale = startVector3.distanceTo(endVector3) / arrowLength;
            let yScale = findArrowCurrentHeight(startVector3, endVector3, object.year);
            let xScale = zScale;
            object.scale.set(xScale, yScale, zScale);

            /*
            Crash course on quaternions. x, y, z, are the three axes. w, the fourth value,
            is the arcosin of half the rotation angle. Form a quaternion like so:

            THREE.quaternion(
                RotationAxis.x * sin(RotationAngle / 2),
                RotationAxis.y * sin(RotationAngle / 2),
                RotationAxis.z * sin(RotationAngle / 2),
                cos(RotationAngle / 2) );

            To find the correct quaternion rotation axis to rotate the arrow, we need to find an axis of rotation
            equidistant to the given endpoint and current end point, as well as another current point on the arrow
            and a target point on the arrow once it's positioned. For ease of calculation, the second point will be
            the tip of the arc of the arrow. This vector will be the intersection between 2 planes equidistant from
            those two sets of points individually. Luckily we can shortcut this by taking the cross product of the
            normal vectors of those planes.

            To find the correct quaternion rotation angle to rotate the arrow, we need to use the current endpoint
            and the given endpoint. These two points lie on the edge of a circle who is normal to the axis of
            rotation and who's center point lies on it. The rotation angle will then be the angle at the center
            point between the current and given endpoints. since we have all 3 side lengths of the triangle drawn
            between those three points (2 of them are the radius of the circle and the other is trivial to calculate)
            we can use the law of cosines to find that angle.

            Then just make a quaternion using those two values and it rotates the arrow correctly.
             */

            // Find the axis of rotation
            let p1 = new THREE.Vector3(0, 0, -1 * arrowLength * zScale);
            p1.add(startVector3);
            let p2 = new THREE.Vector3( 0, arrowHeight * yScale, -1 * arrowLength * zScale / 2);
            p2.add(startVector3);
            let midpoint = averageVectors(startVector3, endVector3);
            let midpointLength = origin.distanceTo(midpoint);
            let p2Prime = midpoint.clone().multiplyScalar( 1 + arrowHeight * yScale / midpointLength );
            let p1NormalVector = p1.clone().sub(endVector3);
            let p2NormalVector = p2.clone().sub(p2Prime);
            let rotationAxis = p1NormalVector.clone().cross(p2NormalVector);
            rotationAxis.normalize();

            // Find the rotation angle. findRadius... function in helperFunctions.js
            let radius1 = findRadiusFromTwoPointsAndAxisOfRotation(startVector3, p1, rotationAxis);
            let radius2 = findRadiusFromTwoPointsAndAxisOfRotation(startVector3, endVector3, rotationAxis);
            let distance = p1.distanceTo(endVector3);

            // Calculate the rotation angle using law of cosines
            let radiusLength = origin.distanceTo(radius1);
            let toACos = 1 - ((distance * distance) / (2 * radiusLength * radiusLength));
            let rotationAngle = Math.acos(toACos);

            // test the sign of the cross of the radii to see if the angle between them is supposed to be negative
            let signTest = radius1.cross(radius2);
            if(signTest.dot(rotationAxis) < 0) rotationAngle = 2 * Math.PI - rotationAngle;

            // Apply the rotation
            let quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(rotationAxis, rotationAngle);
            object.rotation.setFromQuaternion(quaternion);

            pivot.add( object );
            arrows[arrowsSize] = object;
            arrowsSize++;

        },
        // called when loading is in progresses
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

            console.log( 'An error happened' );

        }
    );
}

function makeArrowsFromPlaces(numOfArrows) {

    let ithaca = [-76.4986, 42.4217];       // Longitude and Latitude of Ithaca College 42.4217° N, 76.4986° W
    let california = [-119.4179, 36.7783];  // Longitude and Latitude of California 36.7783° N, 119.4179° W
    let australia = [133.7751, -25.2744]; // Longitude and Latitude of Australia = 25.2744° S, 133.7751° E
    let costaRica = [-83.7534, 9.7489];     // Longitude and Latitude of Costa Rica 9.7489° N, 83.7534° W
    let france = [2.2137, 46.2276];         // Longitude and Latitude of France 46.2276° N, 2.2137° E
    let turkey = [35.2433, 38.9673];        // Longitude and Latitude of Turkey 38.9637° N, 35.2433° E

    let places = [ithaca, australia, costaRica, france, turkey];

    /*
    PERFORMANCE NOTES:
    No performance issues with 1000 arrows.
    Major performance issues with 100,000 arrows.
    Light performance issues with 10,000 arrows.
     */
    for(let i=0; i<numOfArrows; i++) {
        let rand1 = Math.floor(Math.random() * places.length),
            rand2 = Math.floor(Math.random() * places.length),
            group;

        if(i%2) group = true;
        else group = false;
        if(rand1 == rand2)
            i--;
        else
            makeArrow(places[rand1], places[rand2], group);
    }
}

/*
Updates all the arrows height values
*/
function arrowsUpdate() {
    for(let i=0; i<arrowsSize; i++) {
        let yScale = findArrowCurrentHeight(arrows[i].start, arrows[i].end, arrows[i].year);
        let xScale = arrows[i].scale.x;
        let zScale = arrows[i].scale.y;
        if(yScale === -1) arrows[i].visible = false;
        else arrows[i].visible = true;

        arrows[i].scale.y = yScale;
        //console.log("updated arrow of year " +arrows[i].year + " to height: " + yScale );
    }
}

/*
Makes arrows randomly in the world.
 */
function makeRandomArrows(numOfArrows) {
    let minLongitude = -180,
        maxLongitude = 180,
        minLatitude = 0,
        maxLatitude = 90;

    for(let i=0; i<numOfArrows; i++) {

        let place1 = [
            Math.floor(Math.random() * maxLongitude - minLongitude) + minLongitude,
            Math.floor(Math.random() * maxLatitude - minLatitude) + minLatitude
        ];
        let place2 = [
            Math.floor(Math.random() * maxLongitude - minLongitude) + minLongitude,
            Math.floor(Math.random() * maxLatitude - minLatitude) + minLatitude
        ];

        makeArrow(place1, place2);
    }
}

/*
Finds the minimum height of the arrow (so the arrow is gliding along the surface of the globe)
 */
function findArrowMinimumHeight(A, B) {
    // Find C1
    // triangle ACJ is a right triangle, angle c2 is opposite side AJ, which is half of AB.
    let AB = A.distanceTo(B);
    let c1 = Math.asin(AB / (2 * radius));

    // Find AD
    // Using law of cosines on triangle ACD, which is isosceles
    let AD = Math.sqrt(2 * radius * radius * (1 - Math.cos(c1)));

    // Find a2
    // Derived from A = A1 + A2 where A1 is the other angle in triangle ACJ and A is the angle of triangle ACD.
    let a2 = c1 / 2;

    // Find d
    // Trig on triangle ADJ where A2 is opposite side d.
    let d = AD * Math.sin(a2);

    // Find minimum height
    let minHeight = d / arrowHeight;
    return minHeight;
}

/*
Finds the yScale value that makes the arrows height the max height above the globe
*/
function findArrowMaxHeight(A, B) {
    let minHeight = findArrowMinimumHeight(A, B);
    let maxHeight = minHeight + maxHeightAboveGlobe / arrowHeight;
    return maxHeight;
}

/*
Finds the current height of the arrow with the given settings.
*/
function findArrowCurrentHeight(A, B, year) {
    let min = findArrowMinimumHeight(A, B);
    let max = findArrowMaxHeight(A, B);
    let sliderInt = parseInt(slider.value);
    let rangeInt = parseInt(range.value);
    if(sliderInt > year) {
        //Arrow is too old to be shown
        return -1;
    }
    if(sliderInt + rangeInt < year) {
        //Arrow is too new to be shown
        return -1;
    }
    else {
        let dif = max - min;
        let curHeight = min + dif * (sliderInt + rangeInt - year) / (rangeInt);
        return curHeight;
    }
}