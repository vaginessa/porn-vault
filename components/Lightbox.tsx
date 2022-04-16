import Paper from "./Paper";
import styles from "./Lightbox.module.scss";
import CloseIcon from "mdi-react/CloseIcon";

type Props = {
  active: boolean;
  src: string;
  alt?: string;
  onClose: () => void;
};

export default function Lightbox({ onClose, src, alt, active }: Props) {
  return (
    <>
      {active && (
        <div className={styles.lightbox}>
          <div
            className={styles["image-wrap"]}
            style={{
              padding: 25,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              style={{
                borderRadius: 5,
                display: "inline-block",
                objectFit: "contain",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
              src={src}
              alt={alt}
            />
          </div>
          <Paper style={{ padding: 5, maxHeight: "100vh", borderRadius: 0 }}>
            <div style={{ display: "flex" }}>
              <div style={{ flexGrow: 1 }} />
              <div onClick={onClose} className="hover">
                <CloseIcon />
              </div>
            </div>
          </Paper>
        </div>
      )}
    </>
  );
}
