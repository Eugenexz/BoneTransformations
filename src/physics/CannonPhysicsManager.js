import * as CANNON from "cannon";
import {
    BoxGeometry,
    Mesh,
    MeshPhongMaterial,
    Quaternion,
    Vector3, Bone, Euler, Matrix4, Vector4, MathUtils
} from "three";


let world;
let PHYSICS_BODIES = [];
let DEBUG_MESHES = [];


export function CreateCannonPhysics(setup) {

    initCannon(setup.gravity);
    initBodies(setup.bones);

    // Returning the callback function
    // The bones are moved based on the physics bodies' movements
    return function () {
        world.step(1/60);

        let newPos,
            newQuat;

        for(let i = 0; i < setup.bones.length; i++){

            let bone = setup.bones[i];
            //let debugMesh = DEBUG_MESHES[i];

            let physicsPos = PHYSICS_BODIES[i].position;
            let physicsQuat = PHYSICS_BODIES[i].quaternion;

            // Converting the world physics position of the body to the bone's local position
            bone.parent.updateMatrixWorld();
            let mat = bone.parent.matrixWorld.clone().invert();

            newPos = new Vector3(physicsPos.x, physicsPos.y, physicsPos.z).applyMatrix4(mat);

            // Converting the world physics quaternion of the body to the bone's local quaternion
            let rotMat = new Matrix4().extractRotation(mat);
            newQuat = new Quaternion(physicsQuat.x, physicsQuat.y, physicsQuat.z, physicsQuat.w).multiply(new Quaternion().setFromRotationMatrix(rotMat));


            bone.position.copy(newPos);
            //bone.quaternion.copy(newQuat);
        }

    }
}

function initBodies(bones) {

    let prevPhysicsBody;
    const dimension = 0.049;

    for (let i = 0; i < bones.length; i++) {

        let bone = bones[i];
        let worldQuat = new Quaternion();
        let worldPos = new Vector3();

        bone.getWorldPosition(worldPos);
        bone.getWorldQuaternion(worldQuat)

        // ------- Creating a Cannon physics body
        let physicsBody = new CANNON.Body({
            mass: i === 0 ? 0 : 1, // Mass of the first body is 0 to keep the chain in place
            shape: new CANNON.Box(new CANNON.Vec3(dimension / 2, dimension / 2, dimension / 2)),
            position: new CANNON.Vec3(worldPos.x, worldPos.y, worldPos.z),
            //quaternion: new CANNON.Quaternion(worldQuat.x, worldQuat.y, worldQuat.z, worldQuat.w),
        });

        world.add(physicsBody);
        PHYSICS_BODIES.push(physicsBody);

        if(prevPhysicsBody)
            // Connect the current physicsBody to the previous one
            world.addConstraint(new CANNON.LockConstraint(physicsBody, prevPhysicsBody));

        prevPhysicsBody = physicsBody;

        // ------- Creating a cube mesh for visualization
        let debugCubeGeometry = new BoxGeometry(dimension, dimension, dimension, 10, 10);
        let debugCubeMaterial = new MeshPhongMaterial({color: 0x888888 });
        let debugMesh = new Mesh(debugCubeGeometry, debugCubeMaterial);

        debugMesh.position.copy(worldPos);
        debugMesh.quaternion.copy(worldQuat)

        DEBUG_MESHES.push(debugMesh);
        window.scene.add(debugMesh);
    }
}

function initCannon(gravity){
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;
    world.solver.iterations = 50;
    world.solver.tolerance = 0.01;
    world.gravity.set(gravity[0], gravity[1], gravity[2]);
    world.broadphase = new CANNON.NaiveBroadphase();
}