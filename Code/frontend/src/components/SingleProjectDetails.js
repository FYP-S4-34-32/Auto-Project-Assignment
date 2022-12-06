import { useParams } from "react-router-dom";

const SingleProjectDetails = () => {

    const { id } = useParams()
    


    return (
        <h4>Project Details for { id }</h4>
    );
}
 
export default SingleProjectDetails;