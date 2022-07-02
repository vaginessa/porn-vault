import Link from "next/link";
import { Fragment } from "react";

export default function ActorList({ actors }: { actors: { _id: string; name: string }[] }) {
  return (
    <div
      style={{
        fontSize: 14,
        marginTop: 5,
        opacity: 0.66,
      }}
    >
      With{" "}
      {actors.map((actor, index) => (
        <Fragment key={actor._id}>
          <Link key={actor._id} href={`/actor/${actor._id}`} passHref>
            <a className="hover">
              <b>{actor.name}</b>
            </a>
          </Link>
          <span key={`${actor._id}-comma`}>{index < actors.length - 1 && ", "}</span>
        </Fragment>
      ))}
    </div>
  );
}
