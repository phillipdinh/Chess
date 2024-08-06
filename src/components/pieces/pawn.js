export default function Pawn(props) {
	const handleClick = () => {
		props.onClick()
	}
	return (
		<div className={props.color} onClick={handleClick}>
			p
		</div>
	)
}
