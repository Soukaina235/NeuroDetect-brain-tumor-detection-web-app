import FormPatient from "../components/FormPatient";

function AddPatient({ authorized }) {
    console.log(authorized)
    return (

        <FormPatient route="/api/add_patient/" authorized={authorized} />
    );
}

export default AddPatient;
