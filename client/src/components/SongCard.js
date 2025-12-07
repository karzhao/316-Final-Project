import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import Button from '@mui/material/Button';

function SongCard(props) {
    const { store } = useContext(GlobalStoreContext);
    const { song, index, readOnly } = props;

    function handleDragStart(event) {
        if (readOnly) return;
        event.dataTransfer.setData("song", index);
    }

    function handleDragOver(event) {
        if (readOnly) return;
        event.preventDefault();
    }

    function handleDragEnter(event) {
        if (readOnly) return;
        event.preventDefault();
    }

    function handleDragLeave(event) {
        if (readOnly) return;
        event.preventDefault();
    }

    function handleDrop(event) {
        if (readOnly) return;
        event.preventDefault();
        let targetIndex = index;
        let sourceIndex = Number(event.dataTransfer.getData("song"));

        // UPDATE THE LIST
        store.addMoveSongTransaction(sourceIndex, targetIndex);
    }
    function handleRemoveSong(event) {
        if (readOnly) return;
        store.addRemoveSongTransaction(song, index);
    }
    function handleClick(event) {
        // DOUBLE CLICK IS FOR SONG EDITING
        if (event.detail === 2 && !readOnly) {
            console.log("double clicked");
            store.showEditSongModal(index, song);
        }
    }

    let cardClass = "list-card unselected-list-card";
    return (
        <div
            key={index}
            id={'song-' + index + '-card'}
            className={cardClass}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggable="true"
            onClick={handleClick}
        >
            {index + 1}.
            <a
                id={'song-' + index + '-link'}
                className="song-link"
                href={"https://www.youtube.com/watch?v=" + song.youTubeId}>
                {song.title} ({song.year}) by {song.artist}
            </a>
            <Button
                sx={{transform:"translate(-5%, -5%)", width:"5px", height:"30px"}}
                variant="contained"
                id={"remove-song-" + index}
                className="list-card-button"
                onClick={handleRemoveSong}
                disabled={readOnly}
                style={readOnly ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
            >{"\u2715"}</Button>
        </div>
    );
}

export default SongCard;
