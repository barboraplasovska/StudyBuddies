import {Verifier} from "academic-email-verifier";

class AcademicEmailCheckerService {

    isAcademic = async (email: string) => {
        return Verifier.isAcademic(email);
    };

    getInstitutionName = async (email: string) => {
        return Verifier.getInstitutionName(email);
    };
}

const academicEmailCheckerService = new AcademicEmailCheckerService();

export {
    AcademicEmailCheckerService,
    academicEmailCheckerService,
};