"use client";

import dynamic from "next/dynamic";
import ServicePillar from "./ServicePillar";
import { pillars } from "@/content/site";

/**
 * The four pillars, and the scene that belongs to each.
 *
 * Every scene is loaded on demand. Together they are the largest chunk of
 * JavaScript on the site, and none of it is needed to render the words — which
 * are what the page is actually for. Splitting them here means the hero paints
 * without waiting for a single line of geometry code.
 */
const AgentOrb = dynamic(() => import("../three/scenes/AgentOrb"), { ssr: false });
const DashboardAssembly = dynamic(() => import("../three/scenes/DashboardAssembly"), { ssr: false });
const DataFunnel = dynamic(() => import("../three/scenes/DataFunnel"), { ssr: false });
const SecureVault = dynamic(() => import("../three/scenes/SecureVault"), { ssr: false });

const SCENES = [AgentOrb, DashboardAssembly, DataFunnel, SecureVault];

export default function Pillars() {
  return (
    <>
      <section className="section" id="pillars">
        <div className="shell">
          <div className="section-head reveal">
            <span className="eyebrow">{pillars.eyebrow}</span>
            <h2 className="section-title">{pillars.title}</h2>
            <p className="section-sub">{pillars.sub}</p>
          </div>
        </div>
      </section>

      {pillars.items.map((item, i) => {
        const Scene = SCENES[i];
        return (
          <ServicePillar
            key={item.id}
            id={item.id}
            no={item.no}
            eyebrow={item.eyebrow}
            title={item.title}
            lead={item.lead}
            body={item.body}
            points={item.points}
            stages={"stages" in item ? item.stages : undefined}
            stats={"stats" in item ? item.stats : undefined}
            // Alternated so the eye crosses the page rather than running down
            // one column past four objects in the same place.
            flip={i % 2 === 1}
            scene={(progress) => <Scene progress={progress} />}
          />
        );
      })}
    </>
  );
}
