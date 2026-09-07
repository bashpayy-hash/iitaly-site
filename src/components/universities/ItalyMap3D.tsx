"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { CITIES, ITALY_PATH, MAP_H_PX, MAP_W_PX, type CityId } from "@/data/italy";
import { italyPathToShapes } from "@/lib/italyPathToShapes";

// Полноценная 3D-рельефная карта Италии: тот же контур ITALY_PATH, что и у
// плоской карты, экструдирован в толщу + постамент, вид как макет на столе.
// Материалы плоские (flatShading), рёбра обведены линией — фирменный язык
// сайта (жёсткий контур, без градиентов) перенесён в 3D, а не забыт ради
// "вау-эффекта". Palette — прямое продолжение старой ночной карты (тёмная
// вода, тёплая суша, коралловый акцент активного пина).

const CENTER_X = MAP_W_PX / 2;
const CENTER_Y = MAP_H_PX / 2;
const SCALE = 0.062;
const DEPTH = 15;
const BASE_THICKNESS = 6;
const TOP_Y = DEPTH * SCALE;

function cityPosition(x: number, y: number): [number, number, number] {
  return [(x - CENTER_X) * SCALE, TOP_Y, -(y - CENTER_Y) * SCALE];
}

function useReducedMotion() {
  const [reduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  return reduced;
}

function ReliefLand() {
  const shapes = useMemo(() => italyPathToShapes(ITALY_PATH), []);

  const { landGeoms, baseGeoms } = useMemo(() => {
    const land: THREE.ExtrudeGeometry[] = [];
    const base: THREE.ExtrudeGeometry[] = [];
    for (const shape of shapes) {
      const landGeo = new THREE.ExtrudeGeometry(shape, {
        depth: DEPTH,
        bevelEnabled: true,
        bevelThickness: 0.7,
        bevelSize: 0.7,
        bevelSegments: 1,
      });
      landGeo.translate(-CENTER_X, -CENTER_Y, 0);
      landGeo.rotateX(-Math.PI / 2);
      landGeo.scale(SCALE, SCALE, SCALE);
      land.push(landGeo);

      const baseGeo = new THREE.ExtrudeGeometry(shape, { depth: BASE_THICKNESS, bevelEnabled: false });
      baseGeo.translate(-CENTER_X, -CENTER_Y, -BASE_THICKNESS);
      baseGeo.rotateX(-Math.PI / 2);
      baseGeo.scale(SCALE, SCALE, SCALE);
      base.push(baseGeo);
    }
    return { landGeoms: land, baseGeoms: base };
  }, [shapes]);

  return (
    <group>
      {landGeoms.map((geo, i) => (
        <group key={i}>
          <mesh geometry={geo}>
            <meshStandardMaterial attach="material-0" color="#eee2c6" flatShading roughness={0.9} />
            <meshStandardMaterial attach="material-1" color="#211a14" flatShading roughness={1} />
          </mesh>
          <lineSegments geometry={new THREE.EdgesGeometry(geo, 25)}>
            <lineBasicMaterial color="#0d1118" transparent opacity={0.5} />
          </lineSegments>
        </group>
      ))}
      {baseGeoms.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color="#171b22" flatShading roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function CityPin({
  id,
  active,
  big,
  dimmed,
  onSelect,
}: {
  id: CityId;
  active: boolean;
  big: boolean;
  dimmed: boolean;
  onSelect: (id: CityId) => void;
}) {
  const c = CITIES[id];
  const [x, y, z] = cityPosition(c.x, c.y);
  const showLabel = big || active;
  const color = active ? "#e0654f" : big ? "#dfe9f7" : "#8fb6e8";
  const bodyR = active ? 0.62 : big ? 0.46 : 0.3;
  const standH = active ? 1.5 : big ? 1.1 : 0.4;

  function select() {
    onSelect(id);
  }

  return (
    <group
      position={[x, y, z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <mesh position={[0, standH / 2, 0]} onClick={select}>
        <cylinderGeometry args={[bodyR * 0.22, bodyR * 0.32, standH, 8]} />
        <meshStandardMaterial color={color} flatShading opacity={dimmed ? 0.3 : 1} transparent />
      </mesh>
      <mesh position={[0, standH, 0]} onClick={select}>
        <sphereGeometry args={[bodyR, 14, 14]} />
        <meshStandardMaterial
          color={color}
          flatShading
          opacity={dimmed ? 0.3 : 1}
          transparent
          emissive={active ? "#e0654f" : "#000000"}
          emissiveIntensity={active ? 0.35 : 0}
        />
      </mesh>

      <Html center distanceFactor={13} zIndexRange={[10, 0]} style={{ pointerEvents: "auto" }}>
        <button
          type="button"
          onClick={select}
          aria-label={`${c.name} — показать университеты`}
          aria-pressed={active}
          className={`map3d-pin ${showLabel ? "map3d-pin--labeled" : "map3d-pin--dot"} ${
            active ? "is-active" : ""
          } ${dimmed ? "is-dimmed" : ""}`}
        >
          {showLabel ? c.name : <span className="sr-only-map">{c.name}</span>}
        </button>
      </Html>
    </group>
  );
}

function SceneContents({
  activeCity,
  onSelectCity,
  matchedCities,
}: {
  activeCity: CityId | null;
  onSelectCity: (id: CityId) => void;
  matchedCities: Set<CityId>;
}) {
  const cityIds = useMemo(
    () =>
      (Object.keys(CITIES) as CityId[]).sort(
        (a, b) => (CITIES[a].tier === 1 ? 1 : 0) - (CITIES[b].tier === 1 ? 1 : 0),
      ),
    [],
  );

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[-10, 18, 8]} intensity={1.1} />
      <directionalLight position={[8, 10, -12]} intensity={0.35} />

      <ReliefLand />

      {cityIds.map((id) => (
        <CityPin
          key={id}
          id={id}
          active={id === activeCity}
          big={CITIES[id].tier === 1}
          dimmed={matchedCities.size > 0 && !matchedCities.has(id) && id !== activeCity}
          onSelect={onSelectCity}
        />
      ))}
    </>
  );
}

export function ItalyMap3D({
  activeCity,
  onSelectCity,
  matchedCities,
}: {
  activeCity: CityId | null;
  onSelectCity: (id: CityId) => void;
  matchedCities: Set<CityId>;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 30, 34], fov: 40 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color("#0d1118");
        scene.fog = new THREE.Fog("#0d1118", 38, 85);
      }}
    >
      <SceneContents activeCity={activeCity} onSelectCity={onSelectCity} matchedCities={matchedCities} />
      <OrbitControls
        enablePan={false}
        minDistance={26}
        maxDistance={56}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.52}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
