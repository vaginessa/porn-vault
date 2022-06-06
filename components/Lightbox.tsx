import Paper from "./Paper";
import styles from "./Lightbox.module.scss";
import CloseIcon from "mdi-react/CloseIcon";
import LeftIcon from "mdi-react/ChevronLeftBoxIcon";
import RightIcon from "mdi-react/ChevronRightBoxIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import BookmarkedIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";

type Props = {
  active: boolean;
  src: string;
  alt?: string;
  onClose: () => void;

  favorite: boolean;
  bookmark: boolean;
  rating: number | null;

  onFavorite?: () => void;
  onBookmark?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
};

export default function Lightbox(props: Props) {
  const {
    onClose,
    src,
    alt,
    active,
    onFavorite,
    onBookmark,
    onNext,
    onPrevious,
    favorite,
    bookmark,
  } = props;

  const FavIcon = favorite ? HeartIcon : HeartBorderIcon;
  const BookmarkIcon = bookmark ? BookmarkedIcon : BookmarkBorderIcon;

  return (
    <>
      {active && (
        <div className={styles.lightbox}>
          <div className={styles.background}></div>
          <div
            className={styles["image-wrap"]}
            style={{
              padding: 25,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
            onClick={onClose}
          >
            <img
              onClick={(ev) => ev.stopPropagation()}
              style={{
                borderRadius: 5,
                display: "inline-block",
                objectFit: "contain",
                maxWidth: "100%",
                maxHeight: "100%",
                padding: 10,
              }}
              src={src}
              alt={alt}
            />
            <div style={{ display: "flex", gap: 5, marginBottom: 15 }}>
              {onPrevious && (
                <LeftIcon
                  className="hover"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onPrevious();
                  }}
                  color="white"
                  size={36}
                />
              )}
              <FavIcon
                className="hover"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onFavorite?.();
                }}
                color="white"
                size={36}
              />
              <BookmarkIcon
                className="hover"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onBookmark?.();
                }}
                color="white"
                size={36}
              />
              {onNext && (
                <RightIcon
                  className="hover"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onNext();
                  }}
                  color="white"
                  size={36}
                />
              )}
            </div>
          </div>
          {/*  <Paper className={styles.sidebar}>
            <div style={{ display: "flex" }}>
              <div style={{ flexGrow: 1 }} />
              <div onClick={onClose} className="hover">
                <CloseIcon />
              </div>
            </div>
          </Paper> */}
        </div>
      )}
    </>
  );
}
