/* eslint-disable */


import {academicEmailCheckerService} from "domain/service/AcademicEmailCheckerService";

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

String.prototype.cleanString = function(this: string) {
    return this.replace(/[\r\n]/g, "");
}

String.prototype.getSchoolName = async function (this: string) : Promise<string> {
    const isAcademic = await academicEmailCheckerService.isAcademic(this);
    const institutionName = await academicEmailCheckerService.getInstitutionName(this);
    return isAcademic ? institutionName.cleanString() : "GUEST";
}

export {}