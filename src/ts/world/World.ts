import * as THREE from 'three';
import * as CANNON from 'cannon';
import Swal from 'sweetalert2';
import * as $ from 'jquery';

import { CameraOperator } from '../core/CameraOperator';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader  } from 'three/examples/jsm/shaders/FXAAShader';

import { Detector } from '../../lib/utils/Detector';
import { Stats } from '../../lib/utils/Stats';
import * as GUI from '../../lib/utils/dat.gui';
import { CannonDebugRenderer } from '../../lib/cannon/CannonDebugRenderer';
import * as _ from 'lodash';

import { InputManager } from '../core/InputManager';
import * as Utils from '../core/FunctionLibrary';
import { LoadingManager } from '../core/LoadingManager';
import { InfoStack } from '../core/InfoStack';
import { UIManager } from '../core/UIManager';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { IUpdatable } from '../interfaces/IUpdatable';
import { Character } from '../characters/Character';
import { Path } from './Path';
import { CollisionGroups } from '../enums/CollisionGroups';
import { BoxCollider } from '../physics/colliders/BoxCollider';
import { TrimeshCollider } from '../physics/colliders/TrimeshCollider';
import { Vehicle } from '../vehicles/Vehicle';
import { Scenario } from './Scenario';
import { Sky } from './Sky';
import { Ocean } from './Ocean';
import { forEach, times } from 'lodash';
import { Raycaster, Scene, Vector2 } from 'three';
import { NewCollider } from '../physics/colliders/NewCollider';

export class World
{
	public renderer: THREE.WebGLRenderer;
	public camera: THREE.PerspectiveCamera;
	public composer: any;
	public stats: Stats;
	public graphicsWorld: THREE.Scene;
	public sky: Sky;
	public physicsWorld: CANNON.World;
	public parallelPairs: any[];
	public physicsFrameRate: number;
	public physicsFrameTime: number;
	public physicsMaxPrediction: number;
	public clock: THREE.Clock;
	public renderDelta: number;
	public logicDelta: number;
	public requestDelta: number;
	public sinceLastFrame: number;
	public justRendered: boolean;
	public params: any;
	public inputManager: InputManager;
	public cameraOperator: CameraOperator;
	public timeScaleTarget: number = 1;
	public console: InfoStack;
	public cannonDebugRenderer: CannonDebugRenderer;
	public scenarios: Scenario[] = [];
	public characters: Character[] = [];
	public vehicles: Vehicle[] = [];
	public paths: Path[] = [];
	public scenarioGUIFolder: any;
	public updatables: IUpdatable[] = [];
	public raycaster: THREE.Raycaster;
	public mouse: THREE.Vector2;
	public SELECTED: any;

	public mark1: THREE.Mesh;
	public mark2: THREE.Mesh;
	public mark3: THREE.Mesh;
	public mark4: THREE.Mesh;
	public mark5: THREE.Mesh;
	public mark6: THREE.Mesh;
	public mark7: THREE.Mesh;
	public mark8: THREE.Mesh;
	public mark9: THREE.Mesh;

	public marks: THREE.Mesh[];

	private lastScenarioID: string;

	constructor(worldScenePath?: any)
	{
		const scope = this;

		// WebGL not supported
		if (!Detector.webgl)
		{
			Swal.fire({
				icon: 'warning',
				title: 'WebGL compatibility',
				text: 'This browser doesn\'t seem to have the required WebGL capabilities. The application may not work correctly.',
				footer: '<a href="https://get.webgl.org/" target="_blank">Click here for more information</a>',
				showConfirmButton: false,
				buttonsStyling: false
			});
		}

		// Renderer
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		// Mouse event renderer setting option
		this.renderer.setClearColor(0xf0f0f0);

		this.generateHTML();

		// Auto window resize
		function onWindowResize(): void
		{
			scope.camera.aspect = window.innerWidth / window.innerHeight;
			scope.camera.updateProjectionMatrix();
			scope.renderer.setSize(window.innerWidth, window.innerHeight);
			fxaaPass.uniforms['resolution'].value.set(1 / (window.innerWidth * pixelRatio), 1 / (window.innerHeight * pixelRatio));
			scope.composer.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
		}
		window.addEventListener('resize', onWindowResize, false);

		


		// Three.js scene
		this.graphicsWorld = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1010);

		// Mouse event
		this.mouse = new THREE.Vector2();
		console.log('mouse defined', this.mouse);
		let radius = 100, theta = 0;
		// let light = new THREE.DirectionalLight(0xffffff, 1);
		// light.position.set(1, 1, 1).normalize();
		// this.graphicsWorld.add(light);

		// Mouse move event
		let onDocumentMouseMove = (event: any): void =>
		{
			// console.log('onDocumentMouseMove');
			event.preventDefault();
			this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
			this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
		}


		let onMouseClick = (e: any): void =>
		{
			console.log('mouse clicked')

			let gap1 = e.clientX - e.offsetX
			let gap2 = e.clientY - e.offsetY
		
			this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
			this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
		
			this.raycaster.setFromCamera(this.mouse, this.camera);

			let intersects = this.raycaster.intersectObjects(this.marks);

			let mark_name

			if(intersects.length > 0){
				this.marks.forEach(mark => {
					if(mark == intersects[0].object && mark == this.SELECTED){
						mark_name = mark.name
					}
				})
				let url = 'https://www.google.com/search?q=' + mark_name;
				window.open(url,'_blank');
			}


		
		}


		// Passes
		let renderPass = new RenderPass( this.graphicsWorld, this.camera );
		let fxaaPass = new ShaderPass( FXAAShader );

		// FXAA
		let pixelRatio = this.renderer.getPixelRatio();
		fxaaPass.material['uniforms'].resolution.value.x = 1 / ( window.innerWidth * pixelRatio );
		fxaaPass.material['uniforms'].resolution.value.y = 1 / ( window.innerHeight * pixelRatio );

		// Composer
		this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( renderPass );
		this.composer.addPass( fxaaPass );

		// Physics
		this.physicsWorld = new CANNON.World();
		this.physicsWorld.gravity.set(0, -9.81, 0);
		this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
		this.physicsWorld.solver.iterations = 10;
		this.physicsWorld.allowSleep = true;

		this.parallelPairs = [];
		this.physicsFrameRate = 60;
		this.physicsFrameTime = 1 / this.physicsFrameRate;
		this.physicsMaxPrediction = this.physicsFrameRate;

		// RenderLoop
		this.clock = new THREE.Clock();
		this.renderDelta = 0;
		this.logicDelta = 0;
		this.sinceLastFrame = 0;
		this.justRendered = false;

		// Stats (FPS, Frame time, Memory)
		this.stats = Stats();
		// Create right panel GUI
		this.createParamsGUI(scope);

		// Initialization
		this.inputManager = new InputManager(this, this.renderer.domElement);
		this.cameraOperator = new CameraOperator(this, this.camera, this.params.Mouse_Sensitivity);
		this.sky = new Sky(this);
		
		// Load scene if path is supplied
		if (worldScenePath !== undefined)
		{
			let loadingManager = new LoadingManager(this);
			loadingManager.onFinishedCallback = () =>
			{
				this.update(1, 1);
				this.setTimeScale(1);
	
				Swal.fire({
					title: 'Welcome to Sketchbook!',
					text: 'Feel free to explore the world and interact with available vehicles. There are also various scenarios ready to launch from the right panel.',
					footer: '<a href="https://github.com/swift502/Sketchbook" target="_blank">GitHub page</a><a href="https://discord.gg/fGuEqCe" target="_blank">Discord server</a>',
					confirmButtonText: 'Okay',
					buttonsStyling: false,
					onClose: () => {
						UIManager.setUserInterfaceVisible(true);
					}
				});
			};
			loadingManager.loadGLTF(worldScenePath, (gltf) =>
				{
					this.loadScene(loadingManager, gltf);
				}
			);
		}
		else
		{
			UIManager.setUserInterfaceVisible(true);
			UIManager.setLoadingScreenVisible(false);
			Swal.fire({
				icon: 'success',
				title: 'Hello world!',
				text: 'Empty Sketchbook world was succesfully initialized. Enjoy the blueness of the sky.',
				buttonsStyling: false
			});
		}

		
		
		

		this.raycaster = new THREE.Raycaster();

		// Mouse event setting option in Canvas
		document.body.addEventListener('mousemove', onDocumentMouseMove, false);
		document.body.addEventListener('click', onMouseClick, false);
		

		this.render(this);
	}


	

	// Update
	// Handles all logic updates.
	public update(timeStep: number, unscaledTimeStep: number): void
	{
		// console.log('update ', timeStep);
		this.updatePhysics(timeStep);

		// Update registred objects
		this.updatables.forEach((entity) => {
			entity.update(timeStep, unscaledTimeStep);
		});

		// Lerp time scale
		this.params.Time_Scale = THREE.MathUtils.lerp(this.params.Time_Scale, this.timeScaleTarget, 0.2);

		// Physics debug
		if (this.params.Debug_Physics) this.cannonDebugRenderer.update();
	}

	public updatePhysics(timeStep: number): void
	{
		// Step the physics world
		this.physicsWorld.step(this.physicsFrameTime, timeStep);

		this.characters.forEach((char) => {
			if (this.isOutOfBounds(char.characterCapsule.body.position))
			{
				console.log('Character out of Bounds', char.characterCapsule.body.position);
				this.outOfBoundsRespawn(char.characterCapsule.body);
			}
		});

		this.vehicles.forEach((vehicle) => {
			if (this.isOutOfBounds(vehicle.rayCastVehicle.chassisBody.position))
			{
				console.log('vehicle out of Bounds', vehicle.rayCastVehicle.chassisBody.position);
				let worldPos = new THREE.Vector3();
				vehicle.spawnPoint.getWorldPosition(worldPos);
				worldPos.y += 1;
				this.outOfBoundsRespawn(vehicle.rayCastVehicle.chassisBody, Utils.cannonVector(worldPos));
			}
		});
	}

	public isOutOfBounds(position: CANNON.Vec3): boolean
	{
		let inside = position.x > -211.882 && position.x < 211.882 &&
					position.z > -169.098 && position.z < 153.232 &&
					position.y > 0.107;
		let belowSeaLevel = position.y < 14.989;

		return !inside && belowSeaLevel;
	}

	public outOfBoundsRespawn(body: CANNON.Body, position?: CANNON.Vec3): void
	{
		let newPos = position || new CANNON.Vec3(0, 16, 0);
		let newQuat = new CANNON.Quaternion(0, 0, 0, 1);

		body.position.copy(newPos);
		body.interpolatedPosition.copy(newPos);
		body.quaternion.copy(newQuat);
		body.interpolatedQuaternion.copy(newQuat);
		body.velocity.setZero();
		body.angularVelocity.setZero();
	}

	/**
	 * Rendering loop.
	 * Implements fps limiter and frame-skipping
	 * Calls world's "update" function before rendering.
	 * @param {World} world 
	 */
	public render(world: World): void
	{
		this.requestDelta = this.clock.getDelta();

		requestAnimationFrame(() =>
		{
			world.render(world);
		});

		// Find intersections
		this.raycaster.setFromCamera(this.mouse, this.camera);
		let intersects = this.raycaster.intersectObjects(this.marks);
		if(intersects.length > 0){
			if(this.SELECTED != intersects[0].object){
				if(this.SELECTED)
					this.SELECTED.material.emissive.setHex(this.SELECTED.currentHex);
				this.SELECTED = intersects[0].object;
				this.SELECTED.currentHex = this.SELECTED.material.emissive.getHex();
				this.SELECTED.material.emissive.setHex(0xff0000);
				document.body.style.cursor = 'pointer';
			}
		}
		else {
			if(this.SELECTED){
				this.SELECTED.material.emissive.setHex(this.SELECTED.currentHex);
				this.SELECTED = null;
				document.body.style.cursor = 'default';
			}
		}

		// Getting timeStep
		let unscaledTimeStep = (this.requestDelta + this.renderDelta + this.logicDelta) ;
		let timeStep = unscaledTimeStep * this.params.Time_Scale;
		timeStep = Math.min(timeStep, 1 / 30);    // min 30 fps

		// Logic
		world.update(timeStep, unscaledTimeStep);

		// Measuring logic time
		this.logicDelta = this.clock.getDelta();

		// Frame limiting
		let interval = 1 / 60;
		this.sinceLastFrame += this.requestDelta + this.renderDelta + this.logicDelta;
		this.sinceLastFrame %= interval;

		// Stats end
		this.stats.end();
		this.stats.begin();

		// Rotate Marks
		this.marks.forEach(mark => mark.rotation.y -= 0.01)
		
		// Actual rendering with a FXAA ON/OFF switch
		if (this.params.FXAA) this.composer.render();
		else this.renderer.render(this.graphicsWorld, this.camera);
		

		// Measuring render time
		this.renderDelta = this.clock.getDelta();
	}

	public setTimeScale(value: number): void
	{
		this.params.Time_Scale = value;
		this.timeScaleTarget = value;
	}

	public add(worldEntity: IWorldEntity): void
	{
		worldEntity.addToWorld(this);
		this.registerUpdatable(worldEntity);
	}

	public registerUpdatable(registree: IUpdatable): void
	{
		this.updatables.push(registree);
		this.updatables.sort((a, b) => (a.updateOrder > b.updateOrder) ? 1 : -1);
	}

	public remove(worldEntity: IWorldEntity): void
	{
		worldEntity.removeFromWorld(this);
		this.unregisterUpdatable(worldEntity);
	}

	public unregisterUpdatable(registree: IUpdatable): void
	{
		_.pull(this.updatables, registree);
	}

	public loadScene(loadingManager: LoadingManager, gltf: any): void
	{
		this.marks = [];
		var i = 0;
		gltf.scene.traverse((child) => {
			i++;
			if(child.name == 'Pocha1' || child.name == 'RoastChicken' || child.name == 'SnackBar' || child.name == 'gugbabjib'
			 || child.name == 'Pocha2' || child.name == 'hanok' || child.name == 'jibbab' || child.name == 'jumag'
			  || child.name == 'gyeonghoelu'){

				const loader = new THREE.FontLoader();
				console.log('parent file: ', require('path').resolve(__dirname));

				loader.load(require('path').resolve(__dirname,'/fonts/helvetiker_regular.typeface.json'), (font) => {
					const text = '?';  

					const MarkGeometry = new THREE.TextGeometry(text, {
					font: font,
					size: 1,  

					height: 0.05,  

					curveSegments: 12,  

					bevelEnabled: true,  
					bevelThickness: 0.15,  

					bevelSize: 0.1,  

					bevelSegments: 5,  

					});
					const MarkMaterial = new THREE.MeshPhongMaterial({ color: 0x97df5e });
					// let Mark = new THREE.Mesh(MarkGeometry, MarkMaterial);
					if(child.name == 'Pocha1'){
						this.mark1 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark1.position.x = child.position.x
						this.mark1.position.y = child.position.y + 4
						this.mark1.position.z = child.position.z
						this.mark1.name = 'Pocha1'
						this.graphicsWorld.add(this.mark1);
						this.marks.push(this.mark1);
					}
					if(child.name == 'RoastChicken'){
						this.mark2 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark2.position.x = child.position.x
						this.mark2.position.y = child.position.y + 3
						this.mark2.position.z = child.position.z
						this.mark2.name = 'RoastChicken'
						this.graphicsWorld.add(this.mark2);
						this.marks.push(this.mark2);
					}
					if(child.name == 'SnackBar'){
						this.mark3 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark3.position.x = child.position.x
						this.mark3.position.y = child.position.y + 2.7
						this.mark3.position.z = child.position.z
						this.mark3.name = 'SnackBar'
						this.graphicsWorld.add(this.mark3);
						this.marks.push(this.mark3);
					}
					if(child.name == 'gugbabjib'){
						this.mark4 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark4.position.x = child.position.x
						this.mark4.position.y = child.position.y + 2.5
						this.mark4.position.z = child.position.z + 2
						this.mark4.name = 'gugbabjib'
						this.graphicsWorld.add(this.mark4);
						this.marks.push(this.mark4);
					}
					if(child.name == 'Pocha2'){
						this.mark5 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark5.position.x = child.position.x
						this.mark5.position.y = child.position.y + 2
						this.mark5.position.z = child.position.z
						this.mark5.name = 'Pocha2'
						this.graphicsWorld.add(this.mark5);
						this.marks.push(this.mark5);
					}
					if(child.name == 'jibbab'){
						this.mark6 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark6.position.x = child.position.x - 1
						this.mark6.position.y = child.position.y + 3
						this.mark6.position.z = child.position.z + 3
						this.mark6.name = 'jibbab'
						this.graphicsWorld.add(this.mark6);
						this.marks.push(this.mark6);
					}
					if(child.name == 'hanok'){
						this.mark7 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark7.position.x = child.position.x
						this.mark7.position.y = child.position.y + 3
						this.mark7.position.z = child.position.z
						this.mark7.name = 'hanok'
						this.graphicsWorld.add(this.mark7);
						this.marks.push(this.mark7);
					}
					if(child.name == 'jumag'){
						this.mark8 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark8.position.x = child.position.x
						this.mark8.position.y = child.position.y + 2.2
						this.mark8.position.z = child.position.z + 2
						this.mark8.name = 'jumag'
						this.graphicsWorld.add(this.mark8);
						this.marks.push(this.mark8);
					}
					if(child.name == 'gyeonghoelu'){
						this.mark9 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark9.position.x = child.position.x + 1
						this.mark9.position.y = child.position.y + 1.2
						this.mark9.position.z = child.position.z
						this.mark9.name = 'gyeonghoelu'
						this.graphicsWorld.add(this.mark9);
						this.marks.push(this.mark9);
					}
					
					// this.graphicsWorld.add(mark);
					console.log('Added mark of ', child);
					// console.log('mark is', Mark);

				});
				
			}

			if (child.hasOwnProperty('userData'))
			{
				if (child.type === 'Mesh')
				{
					Utils.setupMeshProperties(child);
					this.sky.csm.setupMaterial(child.material);

					if (child.material.name === 'ocean')
					{
						this.registerUpdatable(new Ocean(child, this));
					}
					
				}

				if (child.userData.hasOwnProperty('data'))
				{
					// console.log("child mesh", child);
					if (child.userData.data === 'physics')
					{
						
						if (child.userData.hasOwnProperty('type')) 
						{
							
							// Convex doesn't work! Stick to boxes!
							if (child.userData.type === 'box')
							{
								let phys = new BoxCollider({size: new THREE.Vector3(child.scale.x, child.scale.y, child.scale.z)});
								phys.body.position.copy(Utils.cannonVector(child.position));
								phys.body.quaternion.copy(Utils.cannonQuat(child.quaternion));
								phys.body.computeAABB();

								phys.body.shapes.forEach((shape) => {
									shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
								});

								this.physicsWorld.addBody(phys.body);
							}
							else if (child.userData.type === 'trimesh')
							{
								let phys = new TrimeshCollider(child, {});
								this.physicsWorld.addBody(phys.body);
							}

							// child.visible = false;
						}
					}
					if (child.userData.data === 'path')
					{
						this.paths.push(new Path(child));
					}

					if (child.userData.data === 'scenario')
					{
						this.scenarios.push(new Scenario(child, this));
					}

				}
				// else if (child.type != 'Scene' && child.type != 'Object3D' && !child.name.includes('Path') && !child.name.includes('path'))
				// {
				// 	// if no property of data, then just make it trimesh
				// 	let phys = new TrimeshCollider(child, {});
				// 	this.physicsWorld.addBody(phys.body);
				// }
				// else if(child.type === 'Object3D')
				// {
				// 	let phys = new TrimeshCollider(child, {});
				// 	this.physicsWorld.addBody(phys.body);
				// }
			}
			else{
				console.log('no userData', child);
			}
		});
		console.log('number', i);

		this.graphicsWorld.add(gltf.scene);

		this.marks.forEach(mark => mark.geometry.computeBoundingSphere());

		// Launch default scenario
		let defaultScenarioID: string;
		for (const scenario of this.scenarios) {
			if (scenario.default) {
				defaultScenarioID = scenario.id;
				break;
			}
		}
		if (defaultScenarioID !== undefined) this.launchScenario(defaultScenarioID, loadingManager);
	}
	
	public launchScenario(scenarioID: string, loadingManager?: LoadingManager): void
	{
		this.lastScenarioID = scenarioID;

		this.clearEntities();

		// Launch default scenario
		if (!loadingManager) loadingManager = new LoadingManager(this);
		for (const scenario of this.scenarios) {
			if (scenario.id === scenarioID || scenario.spawnAlways) {
				scenario.launch(loadingManager, this);
			}
		}
	}

	public restartScenario(): void
	{
		if (this.lastScenarioID !== undefined)
		{
			document.exitPointerLock();
			this.launchScenario(this.lastScenarioID);
		}
		else
		{
			console.warn('Can\'t restart scenario. Last scenarioID is undefined.');
		}
	}

	public clearEntities(): void
	{
		for (let i = 0; i < this.characters.length; i++) {
			this.remove(this.characters[i]);
			i--;
		}

		for (let i = 0; i < this.vehicles.length; i++) {
			this.remove(this.vehicles[i]);
			i--;
		}
	}

	public scrollTheTimeScale(scrollAmount: number): void
	{
		// Changing time scale with scroll wheel
		const timeScaleBottomLimit = 0.003;
		const timeScaleChangeSpeed = 1.3;
	
		if (scrollAmount > 0)
		{
			this.timeScaleTarget /= timeScaleChangeSpeed;
			if (this.timeScaleTarget < timeScaleBottomLimit) this.timeScaleTarget = 0;
		}
		else
		{
			this.timeScaleTarget *= timeScaleChangeSpeed;
			if (this.timeScaleTarget < timeScaleBottomLimit) this.timeScaleTarget = timeScaleBottomLimit;
			this.timeScaleTarget = Math.min(this.timeScaleTarget, 1);
		}
	}

	public updateControls(controls: any): void
	{
		let html = '';
		html += '<h2 class="controls-title">Controls:</h2>';

		controls.forEach((row) =>
		{
			html += '<div class="ctrl-row">';
			row.keys.forEach((key) => {
				if (key === '+' || key === 'and' || key === 'or' || key === '&') html += '&nbsp;' + key + '&nbsp;';
				else html += '<span class="ctrl-key">' + key + '</span>';
			});

			html += '<span class="ctrl-desc">' + row.desc + '</span></div>';
		});

		document.getElementById('controls').innerHTML = html;
	}

	private generateHTML(): void
	{
		// Fonts
		$('head').append('<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap" rel="stylesheet">');
		$('head').append('<link href="https://fonts.googleapis.com/css2?family=Solway:wght@400;500;700&display=swap" rel="stylesheet">');
		$('head').append('<link href="https://fonts.googleapis.com/css2?family=Cutive+Mono&display=swap" rel="stylesheet">');

		// Loader
		$(`	<div id="loading-screen">
				<div id="loading-screen-background"></div>
				<h1 id="main-title" class="sb-font">Sketchbook 0.4</h1>
				<div class="cubeWrap">
					<div class="cube">
						<div class="faces1"></div>
						<div class="faces2"></div>     
					</div> 
				</div> 
				<div id="loading-text">Loading...</div>
			</div>
		`).appendTo('body');

		// UI
		$(`	<div id="ui-container" style="display: none;">
				<div class="github-corner">
					<a href="https://github.com/swift502/Sketchbook" target="_blank" title="Fork me on GitHub">
						<svg viewbox="0 0 100 100" fill="currentColor">
							<title>Fork me on GitHub</title>
							<path d="M0 0v100h100V0H0zm60 70.2h.2c1 2.7.3 4.7 0 5.2 1.4 1.4 2 3 2 5.2 0 7.4-4.4 9-8.7 9.5.7.7 1.3 2
							1.3 3.7V99c0 .5 1.4 1 1.4 1H44s1.2-.5 1.2-1v-3.8c-3.5 1.4-5.2-.8-5.2-.8-1.5-2-3-2-3-2-2-.5-.2-1-.2-1
							2-.7 3.5.8 3.5.8 2 1.7 4 1 5 .3.2-1.2.7-2 1.2-2.4-4.3-.4-8.8-2-8.8-9.4 0-2 .7-4 2-5.2-.2-.5-1-2.5.2-5
							0 0 1.5-.6 5.2 1.8 1.5-.4 3.2-.6 4.8-.6 1.6 0 3.3.2 4.8.7 2.8-2 4.4-2 5-2z"></path>
						</svg>
					</a>
				</div>
				<div class="left-panel">
					<div id="controls" class="panel-segment flex-bottom"></div>
				</div>
			</div>
		`).appendTo('body');

		// Canvas
		document.body.appendChild(this.renderer.domElement);
		this.renderer.domElement.id = 'canvas';
	}

	private createParamsGUI(scope: World): void
	{
		this.params = {
			Pointer_Lock: true,
			Mouse_Sensitivity: 0.3,
			Time_Scale: 1,
			Shadows: true,
			FXAA: true,
			Debug_Physics: false,
			Debug_FPS: false,
			Sun_Elevation: 50,
			Sun_Rotation: 145,
		};

		const gui = new GUI.GUI();

		// Scenario
		this.scenarioGUIFolder = gui.addFolder('Scenarios');
		this.scenarioGUIFolder.open();

		// World
		let worldFolder = gui.addFolder('World');
		worldFolder.add(this.params, 'Time_Scale', 0, 1).listen()
			.onChange((value) =>
			{
				scope.timeScaleTarget = value;
			});
		worldFolder.add(this.params, 'Sun_Elevation', 0, 180).listen()
			.onChange((value) =>
			{
				scope.sky.phi = value;
			});
		worldFolder.add(this.params, 'Sun_Rotation', 0, 360).listen()
			.onChange((value) =>
			{
				scope.sky.theta = value;
			});

		// Input
		let settingsFolder = gui.addFolder('Settings');
		settingsFolder.add(this.params, 'FXAA');
		settingsFolder.add(this.params, 'Shadows')
			.onChange((enabled) =>
			{
				if (enabled)
				{
					this.sky.csm.lights.forEach((light) => {
						light.castShadow = true;
					});
				}
				else
				{
					this.sky.csm.lights.forEach((light) => {
						light.castShadow = false;
					});
				}
			});
		settingsFolder.add(this.params, 'Pointer_Lock')
			.onChange((enabled) =>
			{
				scope.inputManager.setPointerLock(enabled);
			});
		settingsFolder.add(this.params, 'Mouse_Sensitivity', 0, 1)
			.onChange((value) =>
			{
				scope.cameraOperator.setSensitivity(value, value * 0.8);
			});
		settingsFolder.add(this.params, 'Debug_Physics')
			.onChange((enabled) =>
			{
				if (enabled)
				{
					this.cannonDebugRenderer = new CannonDebugRenderer( this.graphicsWorld, this.physicsWorld );
				}
				else
				{
					this.cannonDebugRenderer.clearMeshes();
					this.cannonDebugRenderer = undefined;
				}

				scope.characters.forEach((char) =>
				{
					char.raycastBox.visible = enabled;
				});
			});
		settingsFolder.add(this.params, 'Debug_FPS')
			.onChange((enabled) =>
			{
				UIManager.setFPSVisible(enabled);
			});

		gui.open();
	}
}