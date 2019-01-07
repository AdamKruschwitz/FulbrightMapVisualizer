//import * as d3 from "../libs/d3";
//import * as THREE from "../libs/three";
const radius = 228;

let mesh,
    graticule;

d3.json("data/map.json", function(error, topology) {
    if (error) throw error;

    // Create the graticule and land mesh
    graticule = wireframe(graticule10(), new THREE.LineBasicMaterial({color: 0xaaaaaa}));
    mesh = wireframe(topojson.mesh(topology, topology.objects.land), new THREE.LineBasicMaterial({color: 0xff0000}));

    // Make them children of the pivot object
    pivot.add(mesh);
    pivot.add(graticule);

    //scene.add(mesh);
    //scene.add(graticule);

    //pivot.rotation.x = -90;

    d3.timer(function(t) {
        //pivot.rotation.y += 0.01;
        renderer.render(scene, camera);
    });

});

function wireframe(multilinestring, material) {
    let geometry = new THREE.Geometry;
    multilinestring.coordinates.forEach(function(line) {
        d3.pairs(line.map(vertex), function(a, b) {
            geometry.vertices.push(a, b);
        });
    });
    return new THREE.LineSegments(geometry, material);
}

// See https://github.com/d3/d3-geo/issues/95
function graticule10() {
    let epsilon = 1e-6,
        x1 = 180, x0 = -x1, y1 = 80, y0 = -y1, dx = 10, dy = 10,
        X1 = 180, X0 = -X1, Y1 = 90, Y0 = -Y1, DX = 90, DY = 360,
        x = graticuleX(y0, y1, 2.5), y = graticuleY(x0, x1, 2.5),
        X = graticuleX(Y0, Y1, 2.5), Y = graticuleY(X0, X1, 2.5);

    function graticuleX(y0, y1, dy) {
        let y = d3.range(y0, y1 - epsilon, dy).concat(y1);
        return function(x) { return y.map(function(y) { return [x, y]; }); };
    }

    function graticuleY(x0, x1, dx) {
        let x = d3.range(x0, x1 - epsilon, dx).concat(x1);
        return function(y) { return x.map(function(x) { return [x, y]; }); };
    }

    return {
        type: "MultiLineString",
        coordinates: d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X)
            .concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y))
            .concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) { return Math.abs(x % DX) > epsilon; }).map(x))
            .concat(d3.range(Math.ceil(y0 / dy) * dy, y1 + epsilon, dy).filter(function(y) { return Math.abs(y % DY) > epsilon; }).map(y))
    };
}

// Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
function vertex(point) {
    let lambda = point[0] * Math.PI / 180,
        phi = point[1] * Math.PI / 180,
        cosPhi = Math.cos(phi);
    return new THREE.Vector3(
        radius * cosPhi * Math.cos(lambda),
        radius * cosPhi * Math.sin(lambda),
        radius * Math.sin(phi)
    );
}