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

	// Nayeon's
	public mark1: THREE.Mesh;
	public mark2: THREE.Mesh;
	public mark3: THREE.Mesh;
	public mark4: THREE.Mesh;
	public mark5: THREE.Mesh;
	public mark6: THREE.Mesh;
	public mark7: THREE.Mesh;
	public mark8: THREE.Mesh;
	public mark9: THREE.Mesh;
	public info1: THREE.Mesh;
	public info2: THREE.Mesh;
	public info3: THREE.Mesh;
	public info4: THREE.Mesh;
	public info5: THREE.Mesh;
	public info6: THREE.Mesh;
	public info7: THREE.Mesh;
	public info8: THREE.Mesh;
	public info9: THREE.Mesh;

	// Chanyeong's
	public mark10: THREE.Mesh;
	public mark11: THREE.Mesh;
	public mark12: THREE.Mesh;
	public mark13: THREE.Mesh;
	public mark14: THREE.Mesh;
	public info10: THREE.Mesh;
	public info11: THREE.Mesh;
	public info12: THREE.Mesh;
	public info13: THREE.Mesh;
	public info14: THREE.Mesh;

	public marks: THREE.Mesh[];

	public infos: THREE.Mesh[];

	public raycasterList: THREE.Mesh[];

	public removeEntity(objectName) {
		var selectedObject = this.graphicsWorld.getObjectByName(objectName);
		this.graphicsWorld.remove( selectedObject );
	}

	public isObjectPresent(objectName) {
		var selectedObject = this.graphicsWorld.getObjectByName(objectName);
		if (selectedObject) return true;
		else false;
	}


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
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1010);

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

			// let gap1 = e.clientX - e.offsetX
			// let gap2 = e.clientY - e.offsetY
		
			this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
			this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
		
			this.raycaster.setFromCamera(this.mouse, this.camera);

			let intersects = this.raycaster.intersectObjects(this.raycasterList);

			let mesh_name = null

			if(intersects.length > 0){
				this.raycasterList.forEach( mesh => {
					if(mesh == intersects[0].object && mesh == this.SELECTED){
						mesh_name = mesh.name
						console.log('clicked mesh is ', mesh_name);
					}
				})

				// Pocha1
				if(mesh_name == 'Pocha1'){
					if(this.isObjectPresent('Pocha1Info')) this.removeEntity('Pocha1Info')
					else this.graphicsWorld.add(this.info1)
				}
				else if(mesh_name == 'Pocha1Info'){
					let url = 'https://koreabyme.com/korean-street-food/'
					window.open(url,'_blank');
				}

				// RoastChicken
				if(mesh_name == 'RoastChicken'){
					if(this.isObjectPresent('RoastChickenInfo')) this.removeEntity('RoastChickenInfo')
					else this.graphicsWorld.add(this.info2)
				}
				else if(mesh_name == 'RoastChickenInfo'){
					let url = 'https://www.korea.net/TalkTalkKorea/English/community/community/CMN0000003742'
					window.open(url,'_blank');
				}

				// SnackBar
				if(mesh_name == 'SnackBar'){
					if(this.isObjectPresent('SnackBarInfo')) this.removeEntity('SnackBarInfo')
					else this.graphicsWorld.add(this.info3)
				}
				else if(mesh_name == 'SnackBarInfo'){
					let url = 'https://english.visitkorea.or.kr/enu/FOD/FO_ENG_2_5.jsp'
					window.open(url,'_blank');
				}

				// gugbabjib
				if(mesh_name == 'gugbabjib'){
					if(this.isObjectPresent('gugbabjibInfo')) this.removeEntity('gugbabjibInfo')
					else this.graphicsWorld.add(this.info4)
				}
				else if(mesh_name == 'gugbabjibInfo'){
					let url = 'https://www.youtube.com/watch?v=dXqOtq7lB_w'
					window.open(url,'_blank');
				}

				// Pocha2
				if(mesh_name == 'Pocha2'){
					if(this.isObjectPresent('Pocha2Info')) this.removeEntity('Pocha2Info')
					else this.graphicsWorld.add(this.info5)
				}
				else if(mesh_name == 'Pocha2Info'){
					let url = 'https://www.korea.net/NewsFocus/Business/view?articleId=128865'
					window.open(url,'_blank');
				}

				// jibbab
				if(mesh_name == 'jibbab'){
					if(this.isObjectPresent('jibbabInfo')) this.removeEntity('jibbabInfo')
					else this.graphicsWorld.add(this.info6)
				}
				else if(mesh_name == 'jibbabInfo'){
					let url = 'http://theclassyfabulist.blogspot.com/2016/04/life-style-meaning-of-jipbap.html'
					window.open(url,'_blank');
				}

				// hanok
				if(mesh_name == 'hanok'){
					if(this.isObjectPresent('hanokInfo')) this.removeEntity('hanokInfo')
					else this.graphicsWorld.add(this.info7)
				}
				else if(mesh_name == 'hanokInfo'){
					let url = 'https://www.chefspencil.com/top-25-korean-desserts-sweets/'
					window.open(url,'_blank');
				}

				// jumag
				if(mesh_name == 'jumag'){
					if(this.isObjectPresent('jumagInfo')) this.removeEntity('jumagInfo')
					else this.graphicsWorld.add(this.info8)
				}
				else if(mesh_name == 'jumagInfo'){
					let url = 'https://guide.michelin.com/kr/en/article/features/makgeolli'
					window.open(url,'_blank');
				}

				// gyeonghoelu
				if(mesh_name == 'gyeonghoelu'){
					if(this.isObjectPresent('gyeonghoeluInfo')) this.removeEntity('gyeonghoeluInfo')
					else this.graphicsWorld.add(this.info9)
				}
				else if(mesh_name == 'gyeonghoeluInfo'){
					let url = 'https://english.visitkorea.or.kr/enu/FOD/FO_ENG_2_3.jsp'
					window.open(url,'_blank');
				}


				// cheomseongdae
				if(mesh_name == 'cheomseongdae'){
					if(this.isObjectPresent('cheomseongdaeInfo')) this.removeEntity('cheomseongdaeInfo')
					else this.graphicsWorld.add(this.info10)
				}
				else if(mesh_name == 'cheomseongdaeInfo'){
					let url = 'http://www.heritage.go.kr/heri/cul/culSelectDetail.do?VdkVgwKey=11%2C00310000%2C37&pageNo=1_1_2_0'
					window.open(url,'_blank');
				}

				// yesul
				if(mesh_name == 'yesul'){
					if(this.isObjectPresent('yesulInfo')) this.removeEntity('yesulInfo')
					else this.graphicsWorld.add(this.info11)
				}
				else if(mesh_name == 'yesulInfo'){
					let url = 'https://www.sac.or.kr/site/main/home'
					window.open(url,'_blank');
				}

				// biff
				if(mesh_name == 'biff'){
					if(this.isObjectPresent('biffInfo')) this.removeEntity('biffInfo')
					else this.graphicsWorld.add(this.info12)
				}
				else if(mesh_name == 'biffInfo'){
					let url = 'https://www.biff.kr/kor/'
					window.open(url,'_blank');
				}

				// jagalchi
				if(mesh_name == 'jagalchi'){
					if(this.isObjectPresent('jagalchiInfo')) this.removeEntity('jagalchiInfo')
					else this.graphicsWorld.add(this.info13)
				}
				else if(mesh_name == 'jagalchiInfo'){
					let url = 'http://jagalchimarket.bisco.or.kr/'
					window.open(url,'_blank');
				}

				// bexco
				if(mesh_name == 'bexco'){
					if(this.isObjectPresent('bexcoInfo')) this.removeEntity('bexcoInfo')
					else this.graphicsWorld.add(this.info14)
				}
				else if(mesh_name == 'bexcoInfo'){
					let url = 'https://www.bexco.co.kr/kor/Main.do'
					window.open(url,'_blank');
				}

				// else if(mesh_name != null){
				// 	let url = 'https://www.google.com/search?q=' + mesh_name;
				// 	window.open(url,'_blank');
				// }
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
					title: 'Welcome to The Klub!',
					text: 'Feel free to explore the world and interact with Marks. Then click the generated texts to go to the link.',
					footer: '<a href="https://github.com/seungwoodev/metaverse" target="_blank">GitHub page</a>',
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
		let intersects = this.raycaster.intersectObjects(this.raycasterList);
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
		this.infos = [];
		this.raycasterList = [];
		var i = 0;
		gltf.scene.traverse((child) => {
			i++;
			if(child.name == 'Pocha1' || child.name == 'RoastChicken' || child.name == 'SnackBar' || child.name == 'gugbabjib'
			 || child.name == 'Pocha2' || child.name == 'hanok' || child.name == 'jibbab' || child.name == 'jumag'
			  || child.name == 'gyeonghoelu' || child.name == 'cheomseongdae' || child.name == 'yesul' || child.name == 'biff'
			  || child.name == 'jagalchi' || child.name == 'bexco'){

				const loader = new THREE.FontLoader();
				console.log('parent file: ', require('path').resolve(__dirname));

				loader.load(require('path').resolve(__dirname,'/fonts/helvetiker_regular.typeface.json'), (font) => {
					const markText = '?';  

					const MarkGeometry = new THREE.TextGeometry(markText, {
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
						this.raycasterList.push(this.mark1)

						const infoText = 'There are so-called ‘winter snack’ that are only sold in cold winter\n'
						+ 'Visit this link to know about Bungeo ppang, Gun-Goguma, Hotteok\n'
						+ 'The most popular Korean Winter Street food!'; 
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info1 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info1.position.x = child.position.x - 2
						this.info1.position.y = child.position.y
						this.info1.position.z = child.position.z + 6
						this.info1.rotation.y += 0.9
						this.info1.name = 'Pocha1Info'
						this.infos.push(this.info1);
						this.raycasterList.push(this.info1)
					}
					if(child.name == 'RoastChicken'){
						this.mark2 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark2.position.x = child.position.x
						this.mark2.position.y = child.position.y + 3
						this.mark2.position.z = child.position.z
						this.mark2.name = 'RoastChicken'
						this.graphicsWorld.add(this.mark2);
						this.marks.push(this.mark2);
						this.raycasterList.push(this.mark2)

						const infoText = 'During the hottest days of Korea, Koreans eat ‘Samgyetang’\n'
						+ 'or Ginseng Chicken Soup to supplement energy.'; 
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info2 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info2.position.x = child.position.x - 1
						this.info2.position.y = child.position.y
						this.info2.position.z = child.position.z + 6
						this.info2.rotation.y += 0.7
						this.info2.name = 'RoastChickenInfo'
						this.infos.push(this.info2);
						this.raycasterList.push(this.info2)
					}
					if(child.name == 'SnackBar'){
						this.mark3 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark3.position.x = child.position.x
						this.mark3.position.y = child.position.y + 2.7
						this.mark3.position.z = child.position.z
						this.mark3.name = 'SnackBar'
						this.graphicsWorld.add(this.mark3);
						this.marks.push(this.mark3);
						this.raycasterList.push(this.mark3)

						const infoText = 'Bunsik can easily be found at traditional markets, street vendors,\n'
						+ 'and around popular tourist attractions or shopping districts'; 
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info3 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info3.position.x = child.position.x - 4
						this.info3.position.y = child.position.y
						this.info3.position.z = child.position.z + 2.5
						// this.info3.rotation.y
						this.info3.name = 'SnackBarInfo'
						this.infos.push(this.info3);
						this.raycasterList.push(this.info3)
					}
					if(child.name == 'gugbabjib'){
						this.mark4 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark4.position.x = child.position.x
						this.mark4.position.y = child.position.y + 2.5
						this.mark4.position.z = child.position.z + 2
						this.mark4.name = 'gugbabjib'
						this.graphicsWorld.add(this.mark4);
						this.marks.push(this.mark4);
						this.raycasterList.push(this.mark4)

						const infoText = 'Gukbab, hot soup with rice, is a Korean dish\n'
						+ 'made by putting cooked rice into a hot soup or boiling cooked rice in a soup\n'
						+ 'There are many gukbap lovers in Korea!'; 
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info4 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info4.position.x = child.position.x - 4
						this.info4.position.y = child.position.y
						this.info4.position.z = child.position.z + 4
						// this.info4.rotation.y -= 0.7
						this.info4.name = 'gugbabjibInfo'
						this.infos.push(this.info4);
						this.raycasterList.push(this.info4)
					}
					if(child.name == 'Pocha2'){
						this.mark5 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark5.position.x = child.position.x
						this.mark5.position.y = child.position.y + 2
						this.mark5.position.z = child.position.z
						this.mark5.name = 'Pocha2'
						this.graphicsWorld.add(this.mark5);
						this.marks.push(this.mark5);
						this.raycasterList.push(this.mark5)

						const infoText = 'This type of tent-style restaurant is called Pojang macha or Pocha\n'
						+ 'In K-dramas, there is often a scene where a character who is heartbroken\n'
						+ 'or has suffered a bad thing drinks ‘soju’ alone at a Pojang macha'; 
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info5 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info5.position.x = child.position.x - 4
						this.info5.position.y = child.position.y
						this.info5.position.z = child.position.z + 2.5
						// this.info5.rotation.y -= 0.7
						this.info5.name = 'Pocha2Info'
						this.infos.push(this.info5);
						this.raycasterList.push(this.info5)
					}
					if(child.name == 'jibbab'){
						this.mark6 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark6.position.x = child.position.x - 1
						this.mark6.position.y = child.position.y + 3
						this.mark6.position.z = child.position.z + 3
						this.mark6.name = 'jibbab'
						this.graphicsWorld.add(this.mark6);
						this.marks.push(this.mark6);
						this.raycasterList.push(this.mark6)

						const infoText = '“Jipbap”, literally meaning “Home Rice”, means “Home cooking”\n'
						+ 'Usually it means a bowl of rice with side dishes and soup'; 
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info6 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info6.position.x = child.position.x - 6
						this.info6.position.y = child.position.y
						this.info6.position.z = child.position.z + 2.5
						this.info6.rotation.y -= 0.7
						this.info6.name = 'jibbabInfo'
						this.infos.push(this.info6);
						this.raycasterList.push(this.info6)
					}
					if(child.name == 'hanok'){
						this.mark7 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark7.position.x = child.position.x
						this.mark7.position.y = child.position.y + 3
						this.mark7.position.z = child.position.z
						this.mark7.name = 'hanok'
						this.graphicsWorld.add(this.mark7);
						this.marks.push(this.mark7);
						this.raycasterList.push(this.mark7)

						const infoText = 'K-Desserts: Check this link to see top 25 Korean desserts!\n'
						+ 'Tteok, Yakgwa, Sujeonggwa, Sikhye, Bingsu, and Ddungcaron'; 
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info7 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info7.position.x = child.position.x - 3
						this.info7.position.y = child.position.y + 2
						this.info7.position.z = child.position.z - 2
						this.info7.rotation.y -= 1.5
						this.info7.name = 'hanokInfo'
						this.infos.push(this.info7);
						this.raycasterList.push(this.info7)
					}
					if(child.name == 'jumag'){
						this.mark8 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark8.position.x = child.position.x
						this.mark8.position.y = child.position.y + 2.2
						this.mark8.position.z = child.position.z + 2
						this.mark8.name = 'jumag'
						this.graphicsWorld.add(this.mark8);
						this.marks.push(this.mark8);
						this.raycasterList.push(this.mark8)

						const infoText = 'Makgeolli is Korean traditional fermented rice wine\n'
						+ 'There are typical dishes that are eaten with makgeolli\n'
						+ 'such as haemul pajeon, jokbal';
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info8 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info8.position.x = child.position.x - 4
						this.info8.position.y = child.position.y
						this.info8.position.z = child.position.z - 1
						this.info8.rotation.y -= 1.7
						this.info8.name = 'jumagInfo'
						this.infos.push(this.info8);
						this.raycasterList.push(this.info8)
					}
					if(child.name == 'gyeonghoelu'){
						this.mark9 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark9.position.x = child.position.x + 1
						this.mark9.position.y = child.position.y + 1.2
						this.mark9.position.z = child.position.z
						this.mark9.name = 'gyeonghoelu'
						this.graphicsWorld.add(this.mark9);
						this.marks.push(this.mark9);
						this.raycasterList.push(this.mark9)

						const infoText = 'Check this link to read about royal cuisine of Joseon Dynasty!'; 
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info9 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info9.position.x = child.position.x
						this.info9.position.y = child.position.y
						this.info9.position.z = child.position.z - 3
						this.info9.rotation.y -= 3.14
						this.info9.name = 'gyeonghoeluInfo'
						this.infos.push(this.info9);
						this.raycasterList.push(this.info9)
					}
					if(child.name == 'cheomseongdae'){
						this.mark10 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark10.position.x = child.position.x
						this.mark10.position.y = child.position.y + 1
						this.mark10.position.z = child.position.z
						this.mark10.name = 'cheomseongdae'
						this.graphicsWorld.add(this.mark10);
						this.marks.push(this.mark10);
						this.raycasterList.push(this.mark10)

						const infoText = 'Cheomseongdae is an astronomical observatory in the Silla period\n'
						+ 'for observing the movement of celestial bodies\n'
						+ 'It is the oldest astronomical observatory in the East\n'
						+ 'so it shows that high level of science at that time'; 
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info10 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info10.position.x = child.position.x + 5
						this.info10.position.y = child.position.y
						this.info10.position.z = child.position.z - 1
						this.info10.rotation.y -= 3.84
						this.info10.name = 'cheomseongdaeInfo'
						this.infos.push(this.info10);
						this.raycasterList.push(this.info10)
					}
					if(child.name == 'yesul'){
						this.mark11 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark11.position.x = child.position.x
						this.mark11.position.y = child.position.y + 2
						this.mark11.position.z = child.position.z
						this.mark11.name = 'yesul'
						this.graphicsWorld.add(this.mark11);
						this.marks.push(this.mark11);
						this.raycasterList.push(this.mark11)

						const infoText = "Seoul Arts Center is Korea's first complex art center\n"
						+ "Established in 1988"; 
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info11 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info11.position.x = child.position.x - 3
						this.info11.position.y = child.position.y
						this.info11.position.z = child.position.z + 1
						this.info11.rotation.y -= 0.7
						this.info11.name = 'yesulInfo'
						this.infos.push(this.info11);
						this.raycasterList.push(this.info11)

						
					}
					if(child.name == 'biff'){
						this.mark12 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark12.position.x = child.position.x + 5
						this.mark12.position.y = child.position.y + 2
						this.mark12.position.z = child.position.z + 1
						this.mark12.name = 'biff'
						this.graphicsWorld.add(this.mark12);
						this.marks.push(this.mark12);
						this.raycasterList.push(this.mark12)

						const infoText = 'BIFF is an abbreviation for Busan International Film Festival\n'
						+ 'Considered one of the largest film festivals in Asia';  
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info12 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info12.position.x = child.position.x
						this.info12.position.y = child.position.y + 1
						this.info12.position.z = child.position.z + 1
						this.info12.rotation.y -= 0.7
						this.info12.name = 'biffInfo'
						this.infos.push(this.info12);
						this.raycasterList.push(this.info12)

					}
					if(child.name == 'jagalchi'){
						this.mark13 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark13.position.x = child.position.x + 0.5
						this.mark13.position.y = child.position.y + 4
						this.mark13.position.z = child.position.z
						this.mark13.name = 'jagalchi'
						this.graphicsWorld.add(this.mark13);
						this.marks.push(this.mark13);
						this.raycasterList.push(this.mark13)

						const infoText = 'Jagalchi Fish Market is a representative fish market in Busan\n'
						+ 'Located on the southern coast of Nampo-dong';  
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info13 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info13.position.x = child.position.x + 1
						this.info13.position.y = child.position.y + 1
						this.info13.position.z = child.position.z + 5
						this.info13.rotation.y += 1
						this.info13.name = 'jagalchiInfo'
						this.infos.push(this.info13);
						this.raycasterList.push(this.info13)
					}
					if(child.name == 'bexco'){
						this.mark14 = new THREE.Mesh(MarkGeometry, MarkMaterial);
						this.mark14.position.x = child.position.x + 0.5
						this.mark14.position.y = child.position.y + 1
						this.mark14.position.z = child.position.z + 1
						this.mark14.name = 'bexco'
						this.graphicsWorld.add(this.mark14);
						this.marks.push(this.mark14);
						this.raycasterList.push(this.mark14)

						const infoText = 'BEXCO is an abbreviation of Busan Exhibition & Convention Center\n'
						+ 'Located in U-dong, Haeundae-gu, Busan Gwayeong-si';  
						const infoGeometry = new THREE.TextGeometry(infoText, {
							font: font,
							size: 0.2,  
		
							height: 0.01,  
		
							curveSegments: 12,  
		
							bevelEnabled: true,  
							bevelThickness: 0.02,  
		
							bevelSize: 0.02,  
		
							bevelSegments: 5,  
		
							});

					
						const infoMaterial = new THREE.MeshPhongMaterial({ color: 'skyblue' });

						this.info14 = new THREE.Mesh(infoGeometry, infoMaterial);
						this.info14.position.x = child.position.x - 3
						this.info14.position.y = child.position.y
						this.info14.position.z = child.position.z + 1
						this.info14.rotation.y -= 0.7
						this.info14.name = 'bexcoInfo'
						this.infos.push(this.info14);
						this.raycasterList.push(this.info14)

						
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
				<h1 id="main-title" class="sb-font">The Klub</h1>
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
					<a href="https://github.com/seungwoodev/metaverse" target="_blank" title="Fork me on GitHub">
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